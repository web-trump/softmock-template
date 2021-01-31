import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import CodeMirror from "@uiw/react-codemirror";
import { Input } from "antd";
import jsBeautify from "js-beautify";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

import store from "../../../store";
import "./index.less";

function parseParams(params: string) {
  return params.split("&").reduce((pre: any, next) => {
    const item = next.split("=");
    pre[item[0]] = item[1];
    return pre;
  }, {});
}

function RequestBody() {
  const { currentRequestBody, theme } = store;
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    setValue(jsBeautify(currentRequestBody));
  }, [currentRequestBody]);
  const blurHandle = () => {};
  return (
    <div className="body-req-container">
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

export default observer(RequestBody);
