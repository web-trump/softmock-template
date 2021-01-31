import React, { useState, useEffect } from "react";
import { Table, Input, Button } from "antd";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";
import store from "../../../store";

import "./index.less";

function RequestHeader() {
  const { currentRequestHeader, currentRequest, theme, updateCurrentRequest } = store;
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    setValue(jsBeautify(JSON.stringify(currentRequestHeader.headers)));
  }, [currentRequestHeader]);
  const blurHandle = (instance: any) => {
    const headersJson = {
      ...JSON.parse(instance.getValue()),
      Cookie: currentRequestHeader.cookies,
    };
    const headers = Object.keys(headersJson).reduce(
      (pre: any, next) => [...pre, [next, headersJson[next]]],
      []
    );
    if (currentRequest.request && currentRequest.request.headers) {
      currentRequest.request.headers = headers;
    }
    updateCurrentRequest(currentRequest);
  };
  return (
    <div className="header-req-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: "javascript",
        }}
        onBlur={blurHandle}
      ></CodeMirror>
    </div>
  );
}

export default observer(RequestHeader);
