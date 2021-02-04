import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import CodeMirror from "@uiw/react-codemirror";
import jsBeautify from "js-beautify";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

import store from "../../../store";
import "./index.less";

function RequestBody() {
  const { currentRequestBody, setRequestBody, theme } = store;
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    setValue(jsBeautify(currentRequestBody));
  }, [currentRequestBody]);
  const blurHandle = (instance: any) => {
    const value = instance.getValue();
    setRequestBody(JSON.parse(value));
  };

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
