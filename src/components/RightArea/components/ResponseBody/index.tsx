import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import { toJS } from "mobx";
import "codemirror/keymap/sublime";

import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/match-highlighter.js";
import "codemirror/addon/search/jump-to-line.js";

import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";

import store from "../../../store";
import "./index.less";

function ResponseBody() {
  const { currentRequest, codeMode, theme, updateCurrentRequest } = store;
  const { response } = currentRequest || {};
  const [value, setValue] = useState<string>("");

  const blurHandle = (instance: any) => {
    const value = instance.getValue();
    const cR = toJS(store.currentRequest);
    if (cR.response) {
      cR.response.html = value;
      /** 更新数据库的html */
      updateCurrentRequest(cR);
    }
  };
  useEffect(() => {
    const text =
      codeMode === "javascript" || codeMode === "json"
        ? jsBeautify(response?.html || "")
        : response?.html || "";
    setValue(text);
  }, [response?.html, response]);
  return (
    <div className="res-body-container">
      <CodeMirror
        value={value}
        options={{
          theme,
          keyMap: "sublime",
          mode: codeMode,
        }}
        onBlur={blurHandle}
      />
    </div>
  );
}

export default observer(ResponseBody);
