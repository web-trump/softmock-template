import mobx, { observable, action } from "mobx";

import { History, Updates } from "./api";

class Store {
  @observable history: any[] = [];
  msgList: any[] = [];
  @action getHistory = async () => {
    /**
     * 获取历史，只在页面刚进入的时候调用
     */
    const res = await History();
    this.history = res;
  };
  @action getUpdates = () => {
    /**
     * 连接ws，实时更新请求
     */
    const ut = Updates();
    ut.onmessage = (evt) => {
      for (let fn of this.msgList) {
        fn(evt.data);
      }
    };
  };
  msgSubscribe = (fn: (msg: any) => void) => {
    this.msgList.push(fn);
  };
}

export default new Store();
