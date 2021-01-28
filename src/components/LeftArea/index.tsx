import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { Input, Menu } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import GithubLogo from "../../assets/github.svg";

import store from "../store";
import "./index.less";

const { SubMenu } = Menu;

function LeftArea() {
  const { history, historyTitles, index, getUpdates, setCurrentRequest, Delete } = store;
  useEffect(() => {
    /** 启动websockt */
    getUpdates();
  }, []);
  const selectHandle = ({ key }: any) => {
    setCurrentRequest(key);
  };
  const deleteTitle = (e: any, title: string) => {
    e.stopPropagation();
    const historyTarget = history.filter((item) => item.request.host === title);
    for (let his of historyTarget) {
      const { scheme, host, path } = his.request;
      const url = scheme + "://" + host + path.split("?")[0];
      Delete(url, his);
    }
  };
  return (
    <div className="left-container">
      <div className="logo">soft-mock</div>
      <div className="input-filter">
        <Input placeholder="过滤..."></Input>
      </div>
      <div className="menu">
        <Menu
          style={{ width: "100%" }}
          defaultOpenKeys={historyTitles}
          mode="inline"
          theme="dark"
          onSelect={selectHandle}
          defaultSelectedKeys={[index]}
        >
          {historyTitles.map((title, index: number) => (
            <SubMenu
              title={title}
              key={title}
              icon={<DeleteOutlined onClick={(e) => deleteTitle(e, title)} />}
            >
              {history
                .filter((item) => item.request.host === title)
                .map((item, historyIndex: number) => (
                  <Menu.Item key={index + "-" + historyIndex}>
                    {item.request.path.split("?")[0]}
                  </Menu.Item>
                ))}
            </SubMenu>
          ))}
        </Menu>
      </div>
      <div className="footer">
        <img src={GithubLogo} alt="github" />
        <a href="https://github.com/web-trump/soft-mock">Soft-mock Github</a>
      </div>
    </div>
  );
}

export default observer(LeftArea);
