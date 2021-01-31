import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import CodeMirror from "@uiw/react-codemirror";
import JsonToJS from "json-to-ts";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

import store from "../../../store";
import "./index.less";

function ResponseTs() {
  const { currentRequest, theme } = store;
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const value = currentRequest?.response?.html || "";
    console.log("value", value);
    let result = "";
    JsonToJS(JSON.parse(value)).forEach((typeInterface) => {
      result += typeInterface + "\n";
    });
    setValue(result);
  }, [currentRequest]);
  return (
    <div className="ts-body-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: "typescript",
        }}
        // onChange={changeHandle}
      />
    </div>
  );
}

export default observer(ResponseTs);
