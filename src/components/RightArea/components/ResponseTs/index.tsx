import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/theme/eclipse.css";

export default function ResponseTs() {
  return (
    <div>
      <CodeMirror
        value=""
        height="100%"
        options={{
          keyMap: "sublime",
          mode: "typescript",
        }}
        // onChange={changeHandle}
      />
    </div>
  );
}
