import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { Input } from "antd";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import { toJS } from "mobx";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

import store from "../../../store";
import "./index.less";

const TextArea = Input.TextArea;

function ResponseBody() {
  const { currentRequest, codeMode, updateCurrentRequest } = store;
  const { response } = currentRequest || {};
  const [value, setValue] = useState<string>("");
  const changeHandle = (e: any) => {
    // const value = instance.getValue();
    const value = e.target.value;
    setValue(value);
  };
  const blurHandle = () => {
    const cR = toJS(currentRequest);
    if (cR.response) {
      cR.response.html = value;
      /** 更新数据库的html */
      updateCurrentRequest(cR);
    }
  };
  useEffect(() => {
    const text = jsBeautify(response?.html || "");
    setValue(text);
  }, [response?.html, response]);
  return (
    <div className="res-body-container">
      <TextArea
        value={value}
        onChange={changeHandle}
        onBlur={blurHandle}
        autoSize={{ maxRows: 10, minRows: 10 }}
      ></TextArea>
      {/* {init && (
        <CodeMirror
          value={value}
          height="100%"
          options={{
            keyMap: "sublime",
            mode: codeMode,
          }}
          onChange={changeHandle}
        />
      )} */}
    </div>
  );
}

export default observer(ResponseBody);
