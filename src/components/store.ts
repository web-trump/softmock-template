import { action, autorun, makeAutoObservable, computed, runInAction } from "mobx";
import { History, Updates, UpdateInfo, DeleteInfo, ClearAll, CreateRecord } from "../api";
import { uuid } from "../utils";

class Store {
  constructor() {
    makeAutoObservable(this);
  }
  /** 当前指针 */
  index: string = "0-0";
  /** 历史记录 */
  history: any[] = [];
  /** 过滤文本 */
  filterText: string = "";
  /** 连接状态 */
  linkStatus: boolean = false;
  /** 连接状态文字 */
  linkText: "已连接" | "离线" | "准备中" = "准备中";
  /** 主题 */
  theme: "ayu-mirage" | "eclipse" = (localStorage.getItem("theme") as any) || "eclipse";
  /** 切换主题 */
  @action switchTheme = () => {
    this.theme = this.theme === "ayu-mirage" ? "eclipse" : "ayu-mirage";
    localStorage.setItem("theme", this.theme);
  };
  /** 历史记录标题 */
  @computed get historyTitles() {
    const historyTitles: string[] = Array.from(
      new Set(this.history.map((item) => item.request.host))
    );
    return historyTitles;
  }
  @computed get filterHistoryTitles() {
    const historyTitles: string[] = Array.from(
      new Set(this.filterHistory.map((item) => item.request.host))
    );
    return historyTitles;
  }
  /** 当前回复代码的模式 */
  @computed get codeMode() {
    const headers = this.currentResponseHeader;
    const contentType = headers["Content-Type"] || headers["content-type"];
    return contentType ? contentType.split(";")[0].split("/")[1] : "html";
  }
  @computed get filterHistory() {
    return this.getFilterHistory(this.filterText);
  }
  getFilterHistory = (text: string) => {
    return this.history.filter((item) => {
      const { scheme, host, path } = item.request;
      const url = scheme + "://" + host + path.split("?")[0];
      return url.includes(text);
    });
  };
  /** 设置过滤文本 */
  @action setFilterText = (text: string) => {
    this.filterText = text;
  };
  /** 展示的当前请求 */
  @computed get currentRequest() {
    const [index, historyIndex]: any = this.index.split("-");
    if (!this.filterHistoryTitles.length) return {};
    const title = this.filterHistoryTitles[+index];
    if (!title) return {};
    const item = this.filterHistory.filter((item) => item.request.host === title)[historyIndex];
    return item;
  }
  /** 当前url */
  @computed get currentUrl() {
    if (!this.currentRequest?.request) return "";
    const { scheme, host, path } = this.currentRequest.request;
    const url = scheme + "://" + host + path.split("?")[0];
    return url;
  }
  /** 更新当前请求 */
  @action updateCurrentRequest = async (newRequest: any) => {
    const current = this.history.find((item) => item === this.currentRequest);
    Object.assign(current, newRequest);
    this.history = [...this.history];
    if (!newRequest.request) return;
    const { scheme, host, path } = newRequest.request;
    const url = scheme + "://" + host + path.split("?")[0];
    await UpdateInfo(btoa(url), newRequest);
  };
  /** 获取历史记录 */
  getHistory = autorun(async () => {
    const res = await History();
    this.history = res;
  });
  /** 删除记录 */
  @action Delete = async (url = this.currentUrl, request = this.currentRequest) => {
    await DeleteInfo(btoa(url));
    const currentIndex = this.history.findIndex((item) => item === request);
    this.history.splice(currentIndex, 1);
    this.history = [...this.history];
  };
  @action getUpdates = () => {
    const ut = Updates();
    ut.onopen = () => {
      console.log("Connection open ...");
    };
    ut.onmessage = (evt) => {
      const { cmd, data } = JSON.parse(evt.data);
      if (cmd === "update") {
        const { scheme, host, path } = data.request;
        const url = scheme + "://" + host + path.split("?")[0];
        const me = this.history.find((item) => {
          const { scheme, host, path } = item.request;
          return url === scheme + "://" + host + path.split("?")[0];
        });
        if (me) {
          me.request = data.request;
          me.response = data.response;
        } else {
          console.log("未找到");
        }
      } else {
        this.history.push({ ...data, status: true });
      }
      this.history = [...this.history];
    };
    const interval = setInterval(() => {
      runInAction(() => {
        this.linkStatus = ut.OPEN === ut.readyState;

        this.linkText = ut.OPEN !== ut.readyState ? "离线" : "已连接";
      });

      if (!this.linkStatus) {
        /** 尝试重新连接 */
        clearInterval(interval);
        this.getUpdates();
      }
    }, 1000);
  };
  /** 设置当前请求 */
  @action setCurrentRequest = (index: string) => {
    this.index = index;
  };
  /** 当前请求的请求头 */
  @computed get currentRequestHeader() {
    const headerList = this.currentRequest?.request?.headers || [];
    const result = headerList.reduce((pre: any, next: any) => ({ ...pre, [next[0]]: next[1] }), {});
    const cookies = result["Cookie"];
    delete result["Cookie"];
    return {
      headers: result,
      cookies,
    };
  }
  /** 清除所有 */
  @action clearAll = async () => {
    await ClearAll();
  };
  /** 当前请求的回复头 */
  @computed get currentResponseHeader() {
    const headerList = this.currentRequest?.response?.headers || [];
    const result = headerList.reduce((pre: any, next: any) => ({ ...pre, [next[0]]: next[1] }), {});
    return result;
  }
  /** 获取当前请求体 */
  @computed get currentRequestBody() {
    const contentType =
      this.currentRequestHeader.headers["content-type"] ||
      this.currentRequestHeader.headers["Content-Type"] ||
      "/null";
    if (contentType.includes("json")) {
      return this.currentRequest?.request?.raw_content || "";
    } else {
      return JSON.stringify(this.parseParams(this.currentRequest?.request?.raw_content || ""));
    }
  }
  parseParams = (params: string) => {
    return params.split("&").reduce((pre: any, next) => {
      const item = next.split("=");
      pre[item[0]] = item[1];
      return pre;
    }, {});
  };

  /** 设置当前请求体 */
  /** 创建请求 */
  createRequest = async (scheme: string, host: string, path: string) => {
    const port = scheme === "https" ? 443 : 80;
    /** 构建新的请求 */
    const req: any = {
      id: uuid(),
      intercepted: false,
      is_replay: null,
      marked: false,
      modified: false,
      type: "http",
      status: "1",
    };
    /** 默认的request */
    req.request = {
      contentHash: null,
      contentLength: null,
      headers: [
        [
          "user-agent",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
        ],
      ],
      host,
      http_version: "HTTP/2.0",
      is_replay: false,
      method: "GET",
      path,
      port,
      pretty_host: host,
      raw_content: "",
      scheme,
      timestamp_end: +(Date.now() / 1e3).toFixed(6),
      timestamp_start: +((Date.now() - 1) / 1e3).toFixed(6),
    };
    /** 默认的response  */
    req.response = {
      contentHash: "e30be77de893682db1e583c6f4bc17a2a8c8c420736b8c4ac12b1d39abdfa9f4",
      contentLength: 4550,
      html: '{ "code" : 0, "msg" : "welcome to soft-mock" }',
      headers: [
        ["server", "Tengine"],
        ["content-type", "application/json"],
      ],
      http_version: "HTTP/1.1",
      is_replay: false,
      reason: "OK",
      status_code: 200,
      timestamp_end: +(Date.now() / 1e3).toFixed(6),
      timestamp_start: +((Date.now() - 1) / 1e3).toFixed(6),
    };
    /** server_conn */
    req.server_conn = {
      address: [host, port],
      alpn_proto_negotiated: "h2",
      cipher_list: null,
      cipher_name: null,
      error: null,
      id: uuid(),
      ip_address: ["114.80.187.67", port],
      sni: host,
      source_address: ["192.168.2.59", 50591],
      state: 0,
      timestamp_end: null,
      timestamp_start: +((Date.now() - 1) / 1e3).toFixed(6),
      timestamp_tcp_setup: +((Date.now() - 1) / 1e3).toFixed(6),
      timestamp_tls_setup: +((Date.now() - 1) / 1e3).toFixed(6),
      tls: null,
      tls_established: true,
      tls_version: "TLSv1.3",
      via: null,
      via2: null,
    };
    /** 请求接口 */
    await CreateRecord(scheme + "://" + host + path, {
      cmd: "update",
      resource: "flows",
      data: req,
    });
    /** 更新history */
    this.history.push(req);
    this.index = "0-0";
  };
}

export default new Store();
