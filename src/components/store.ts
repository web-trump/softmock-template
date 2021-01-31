import { action, autorun, makeAutoObservable, computed, runInAction } from "mobx";
import { History, Updates, UpdateInfo, DeleteInfo, ClearAll } from "../api";

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
    return this.history.filter((item) => {
      const { scheme, host, path } = item.request;
      const url = scheme + "://" + host + path.split("?")[0];
      return url.includes(this.filterText);
    });
  }
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
}

export default new Store();
