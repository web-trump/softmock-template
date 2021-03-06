import React, { useRef } from "react";
import { Input, Button, message } from "antd";
import { observer } from "mobx-react";

import store from "../../../store";
import "./index.less";

function RequestSetting() {
  const { currentRequest, currentUrl, updateCurrentRequest } = store;
  const scheme = useRef("");
  const path = useRef("");
  const query = useRef("");
  const method = useRef("");
  const aliasName = useRef("");
  const updateHandle = async () => {
    currentRequest.request.scheme = scheme.current || currentRequest.request.scheme;
    currentRequest.request.path = path.current
      ? path.current + (query.current.startsWith("?") ? query.current : "?" + query.current)
      : currentRequest.request.path;
    currentRequest.request.method = method.current.toUpperCase() || currentRequest.request.method;
    currentRequest.request.aliasName = aliasName.current || "";
    const provideUrl =
      currentRequest.request.scheme +
      "://" +
      currentRequest.request.host +
      currentRequest.request.path.split("?")[0] +
      " " +
      method;
    await updateCurrentRequest(currentRequest, provideUrl);
    message.success("更新成功");
  };
  return (
    <div key={currentUrl}>
      <div className="input-container">
        <Input
          placeholder="请输入协议"
          prefix={<div className="prefix">scheme:</div>}
          defaultValue={currentRequest.request.scheme}
          onBlur={(e) => {
            scheme.current = e.currentTarget.value;
          }}
        />
        <div className="wrap"></div>
        <Input
          placeholder="请输入path"
          prefix={<div className="prefix">path:</div>}
          defaultValue={currentRequest.request.path.split("?")[0]}
          onBlur={(e) => {
            path.current = e.currentTarget.value;
          }}
        />
      </div>
      <div className="input-container">
        <Input
          placeholder="请输入query"
          prefix={<div className="prefix">query:</div>}
          defaultValue={currentRequest.request.path.split("?")[1]}
          onBlur={(e) => {
            query.current = e.currentTarget.value;
          }}
        />
        <div className="wrap"></div>
        <Input
          placeholder="请输入请求方式"
          prefix={<div className="prefix">请求方式:</div>}
          defaultValue={currentRequest.request.method}
          onBlur={(e) => {
            method.current = e.currentTarget.value;
          }}
        />
      </div>
      <div className="input-container">
        <Input
          placeholder="请输入别名"
          prefix={<div className="prefix">别名:</div>}
          defaultValue={currentRequest.request.aliasName || ""}
          onBlur={(e) => {
            aliasName.current = e.currentTarget.value;
          }}
        />
      </div>
      <Button type="ghost" onClick={updateHandle}>
        确定
      </Button>
    </div>
  );
}

export default observer(RequestSetting);
