import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Input, Menu, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import GithubLogo from "../../assets/github.svg";
import Logo from "../../assets/logo.jpg";
import ClearLogo from "../../assets/clear.svg";
import ThemeLogo from "../../assets/theme.svg";

import store from "../store";
import "./index.less";

const { SubMenu } = Menu;

function LeftArea() {
  const {
    history,
    historyTitles,
    index,
    linkStatus,
    linkText,
    filterText,
    filterHistory,
    filterHistoryTitles,
    getUpdates,
    setCurrentRequest,
    Delete,
    clearAll,
    setFilterText,
    switchTheme,
  } = store;
  useEffect(() => {
    /** 启动websockt */
    getUpdates();
  }, []);
  const [showModal, setShowModal] = useState<boolean>(false);
  const selectHandle = ({ key }: any) => {
    setCurrentRequest(key);
  };
  const clearAllHandle = async () => {
    /** 清除列表 */
    await clearAll();
    setShowModal(false);
    store.history = [];
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
      <div className="logo">
        <img src={Logo} alt="logo" />
        <img src={ThemeLogo} className="setting" alt="主题" onClick={switchTheme} />
        <img
          className="clear-all"
          src={ClearLogo}
          alt="清除所有"
          onClick={() => setShowModal(true)}
        />
        <div className={linkStatus ? "link" : "no-link"}>{linkText}</div>
      </div>
      <div className="input-filter">
        <Input
          placeholder="过滤..."
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
          }}
        ></Input>
      </div>
      <div className="wrap"></div>
      <div className="menu">
        <Menu
          style={{ width: "100%" }}
          defaultOpenKeys={historyTitles}
          mode="inline"
          theme="dark"
          onSelect={selectHandle}
          defaultSelectedKeys={[index]}
        >
          {filterHistoryTitles.map((title, index: number) => {
            const thisHistory = filterHistory.filter((item) => item.request.host === title);
            return (
              <SubMenu
                title={title + "  " + thisHistory.length}
                key={title}
                icon={<DeleteOutlined onClick={(e) => deleteTitle(e, title)} />}
              >
                {thisHistory.map((item, historyIndex: number) => (
                  <Menu.Item key={index + "-" + historyIndex}>
                    {item.request.path.split("?")[0]}
                  </Menu.Item>
                ))}
              </SubMenu>
            );
          })}
        </Menu>
      </div>
      <div className="footer">
        <img src={GithubLogo} alt="github" />
        <a href="https://github.com/web-trump/soft-mock">Soft-mock Github</a>
      </div>
      <Modal
        title="你要清除列表吗"
        visible={showModal}
        okText="清除"
        cancelText="取消"
        onCancel={() => setShowModal(false)}
        onOk={clearAllHandle}
      ></Modal>
    </div>
  );
}

export default observer(LeftArea);
