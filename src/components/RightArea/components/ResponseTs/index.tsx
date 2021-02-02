import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { message } from "antd";
import jsBeautify from "js-beautify";
import CodeMirror from "@uiw/react-codemirror";
import JsonToJS from "json-to-ts";
import { mock as intermock } from "intermock";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

import store from "../../../store";
import "./index.less";

function ResponseTs() {
  const { currentRequest, theme, lastMockDate, updateCurrentRequest } = store;
  const [value, setValue] = useState<string>("");
  const tsChangeHandle = (instance: any) => {
    const value = instance.getValue();
    setValue(jsBeautify(value));
  };
  useEffect(() => {
    if (value) return;
    const text = currentRequest?.response?.html || "";
    let result = "";
    const tsCon: any[] = [];
    JsonToJS(JSON.parse(text)).forEach((typeInterface) => {
      tsCon.push(typeInterface);
      result += typeInterface + "\n";
    });
    setValue(result);
  }, [currentRequest]);
  useEffect(() => {
    console.log("mock data");
    if (!value) return;

    const mock = intermock({
      files: [["test", value]],
      output: "json",
    });
    const newData = JSON.stringify(JSON.parse(mock as string).RootObject);
    const cR = toJS(store.currentRequest);
    if (!cR.response) {
      cR.response = {};
    }
    cR.response.html = newData;
    /** 更新数据库的html */
    updateCurrentRequest(cR).then(() => {
      message.success("已按照typescript mock了数据");
    });
  }, [lastMockDate.getTime()]);
  return (
    <div className="ts-body-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: "typescript",
        }}
        onBlur={tsChangeHandle}
        // onChange={changeHandle}
      />
    </div>
  );
}

export default observer(ResponseTs);
