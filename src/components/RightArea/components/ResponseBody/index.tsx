import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { observer } from "mobx-react";
import jsBeautify from "js-beautify";
import { Button, Upload } from "antd";
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
  const {
    currentRequest,
    codeMode,
    theme,
    currentResponseHeader,
    index: menuKey,
    updateCurrentRequest,
  } = store;
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
  const uploadHandle = (file: any) => {
    const r = new FileReader();
    r.onload = function () {
      const base64 = (r.result as string).split("base64,")[1];
      const cR = toJS(store.currentRequest);
      if (cR.response) {
        cR.response.html = base64;
        /** 更新数据库的html */
        updateCurrentRequest(cR);
      }
    };
    r.readAsDataURL(file);
    return false;
  };
  const contentType =
    currentResponseHeader["content-type"] || currentResponseHeader["Content-Type"] || "";
  const isImage = contentType.includes("image");
  const isVideo = contentType.includes("video");
  useEffect(() => {
    const text =
      codeMode === "javascript" || codeMode === "json"
        ? jsBeautify(response?.html || "")
        : response?.html || "";
    setValue(text);
  }, [response?.html, response]);
  return isImage ? (
    <div className="img-container">
      <div className="img-con">
        <img src={"data:" + contentType + ";base64," + value} alt="img" />
      </div>
      <Upload showUploadList={false} accept=".png,.gif,.jpg,.jpeg" beforeUpload={uploadHandle}>
        <Button>替换图片</Button>
      </Upload>
    </div>
  ) : isVideo ? (
    <video src={atob(value)}></video>
  ) : (
    <div className="res-body-container" key={contentType.toString()}>
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
