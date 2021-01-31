import request from "./server";
import { WS_BASE_URL } from "./constant";

/** 获取历史数据 */
export const History = (): Promise<any[]> => request.get("/flows.json");
/** 检测数据改变 ws */
export const Updates = () => new WebSocket(WS_BASE_URL);
/** 网页手动更新数据 */
export const UpdateInfo = (url: string, detail: any): Promise<string> =>
  request.post("/update_flow?url=" + url + "&status=" + detail.status || "0", {
    cmd: "update",
    resource: "flows",
    data: detail,
  });
/** 删除记录 */
export const DeleteInfo = (url: string): Promise<string> => request.post("/delete_flow?url=" + url);
/** 清除所有 */
export const ClearAll = (): Promise<string> => request.post("/clear_all");
