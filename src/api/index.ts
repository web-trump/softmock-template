import request from "./server";
import { WS_BASE_URL } from "./constant";

/** 获取历史数据 */
export const History = request.get("/flows.json");
/** 检测数据改变 ws */
export const Updates = new WebSocket(WS_BASE_URL);
