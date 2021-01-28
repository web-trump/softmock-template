import React from "react";

import LeftArea from "./components/LeftArea";
import RightArea from "./components/RightArea";
import "./App.less";

function App() {
  return (
    <div className="App">
      <LeftArea></LeftArea>
      <RightArea></RightArea>
    </div>
  );
}

export default App;
