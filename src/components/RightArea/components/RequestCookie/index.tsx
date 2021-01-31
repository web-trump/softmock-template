import React, { useState, useEffect } from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";
import store from "../../../store";

import "./index.less";

function parseCookie(cookies: string) {
  const result: any = {};
  for (let cookie of cookies.split(";")) {
    const [title, value] = cookie.split("=");
    result[title] = value;
  }
  return result;
}
function dumpCookie(cookies: any) {
  return Object.keys(cookies)
    .reduce((pre: any, next) => [...pre, `${next}=${cookies[next]}`], [])
    .join(";");
}

function RequestHeader() {
  const { currentRequestHeader, currentRequest, theme, updateCurrentRequest } = store;
  const [value, setValue] = useState<string>("");
  const blurHandle = (instance: any) => {
    const value = instance.getValue();
    const headersJson = {
      ...currentRequestHeader.headers,
      Cookie: dumpCookie(JSON.parse(value)),
    };
    const headers = Object.keys(headersJson).reduce(
      (pre: any, next) => [...pre, [next, headersJson[next]]],
      []
    );
    currentRequest.request.headers = headers;
    updateCurrentRequest(currentRequest);
  };
  useEffect(() => {
    console.log("currentRequestHeader.cookies", toJS(currentRequestHeader.cookies));
    setValue(jsBeautify(JSON.stringify(parseCookie(currentRequestHeader.cookies || ""))));
  }, [currentRequestHeader]);
  return (
    <div className="cookie-req-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: "javascript",
        }}
        onBlur={blurHandle}
      />
    </div>
  );
}

export default observer(RequestHeader);
