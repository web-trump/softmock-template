import { action, autorun, makeAutoObservable, computed, reaction } from "mobx";
import { History, Updates, UpdateInfo, DeleteInfo } from "../api";

class Store {
  constructor() {
    makeAutoObservable(this);
  }
  /** 当前指针 */
  index: string = "0-0";
  /** 历史记录 */
  history: any[] = [];
  /** 历史记录标题 */
  @computed get historyTitles() {
    const historyTitles: string[] = Array.from(
      new Set(this.history.map((item) => item.request.host))
    );
    return historyTitles;
  }
  /** 当前回复代码的模式 */
  @computed get codeMode() {
    const { headers } = this.currentResponseHeader;
    const contentType = headers.find(
      (item: any) => item.title === "Content-Type" || item.title === "content-type"
    );
    return contentType ? contentType.value.split(";")[0].split("/")[1] : "html";
  }
  /** 展示的当前请求 */
  @computed get currentRequest() {
    const [index, historyIndex]: any = this.index.split("-");
    const title = this.historyTitles[+index];
    if (!title) return {};
    const item = this.history.filter((item) => item.request.host === title)[historyIndex];
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
      console.log(evt.data);
    };
  };
  /** 设置当前请求 */
  @action setCurrentRequest = (index: string) => {
    this.index = index;
  };
  /** 当前请求的请求头 */
  @computed get currentRequestHeader() {
    const headerList = this.currentRequest?.request?.headers || [];
    const result = headerList.reduce(
      (pre: any, next: any) => (pre.push({ title: next[0], value: next[1] }), pre),
      []
    );
    const cookieItemIndex = result.findIndex((item: any) => item["Cookie"]);
    const cookies = result.splice(cookieItemIndex, 1);
    return {
      headers: result,
      cookies: cookies[0]?.value,
    };
  }
  /** 当前请求的回复头 */
  @computed get currentResponseHeader() {
    const headerList = this.currentRequest?.response?.headers || [];
    const result = headerList.reduce(
      (pre: any, next: any) => (pre.push({ title: next[0], value: next[1] }), pre),
      []
    );
    const cookieItemIndex = result.findIndex((item: any) => item["Cookie"]);
    const cookies = result.splice(cookieItemIndex, 1);
    return {
      headers: result,
      cookies: cookies[0]?.value,
    };
  }
}

export default new Store();
