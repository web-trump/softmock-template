import React, { useState, useEffect } from "react";
import { Table, Input, Button } from "antd";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";
import store from "../../../store";

import "./index.less";

function ResponseHeader() {
  const [value, setValue] = useState<string>();
  const { currentResponseHeader, currentRequest, theme, updateCurrentRequest } = store;
  useEffect(() => {
    setValue(jsBeautify(JSON.stringify(currentResponseHeader)));
  }, [currentResponseHeader]);
  const blurHandle = (instance: any) => {
    const headersJson = JSON.parse(instance.getValue());
    const headers = Object.keys(headersJson).reduce(
      (pre: any, next) => [...pre, [next, headersJson[next]]],
      []
    );
    if (currentRequest.response) {
      currentRequest.response.headers = headers;
    } else {
      currentRequest.response = {
        headers,
      };
    }

    updateCurrentRequest(currentRequest);
  };
  return (
    <div className="header-body-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: "javascript",
        }}
        // onInputRead={changeHandle}
        onBlur={blurHandle}
      />
    </div>
  );
}

export default observer(ResponseHeader);
