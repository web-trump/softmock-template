import axios from "axios";

import { BASE_URL, REQUEST_TIMEOUT, REQUEST_HEADERS } from "./constant";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: REQUEST_HEADERS,
});

/**拦截器 */
axios.interceptors.response.use((res) => {
  return res;
});

export default request;
