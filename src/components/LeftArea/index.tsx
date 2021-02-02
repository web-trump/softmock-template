import React, { useEffect, useState, useLayoutEffect } from "react";
import { observer } from "mobx-react";
import { Input, Menu, Modal, message, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import GithubLogo from "../../assets/github.svg";
import Logo from "../../assets/logo.jpg";
import ClearLogo from "../../assets/clear.svg";
import ThemeLogo from "../../assets/theme.svg";
import AddLogo from "../../assets/add.svg";

import store from "../store";
import "./index.less";
import { exception } from "console";

const { SubMenu } = Menu;

function LeftArea() {
  const {
    history,
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
    getFilterHistory,
    createRequest,
  } = store;
  useEffect(() => {
    /** 启动websockt */
    getUpdates();
  }, []);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUrl, setNewUrl] = useState<string>("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const selectHandle = ({ key }: any) => {
    setCurrentRequest(key);
  };
  const openChangeHandle = (openKeys: any[]) => {
    setOpenKeys(openKeys);
    localStorage.setItem("openKeys", JSON.stringify(openKeys));
  };
  const clearAllHandle = async () => {
    /** 清除列表 */
    await clearAll();
    setShowModal(false);
    store.history = [];
  };
  const deleteTitle = (e: any, title: string) => {
    e.stopPropagation();
    const historyTarget = history.filter(
      (item) => item.request.scheme + "://" + item.request.host === title
    );
    for (let his of historyTarget) {
      const { scheme, host, path } = his.request;
      const url = scheme + "://" + host + path.split("?")[0];
      Delete(url, his);
    }
  };
  const addRequestHandle = async () => {
    let scheme, host, path;
    try {
      scheme = newUrl.split("://")[0];
      host = newUrl.split("://")[1].split("/")[0];
      path =
        Array.from(newUrl)
          .slice((scheme + host).length + 3)
          .join("")
          .split("?")[0] || "/";
    } catch (e) {
      message.error("请输入正确的url");
      return;
    }
    const host_filter = document.location.href.includes("host_filter=")
      ? document.location.href.split("host_filter=")[1].split("&")[0]
      : "";
    if (!host.includes(host_filter)) {
      message.error(`host必须包含${host_filter}`);
      return;
    }
    /** 较检是否已经存在 */
    const checked = !getFilterHistory(newUrl).length;
    if (checked) {
      setShowAddModal(false);
      await createRequest(scheme.trim(), host.trim(), path.trim());
      message.success("创建成功");
    } else {
      message.warn("链接已存在");
    }
  };
  useLayoutEffect(() => {
    const keys = JSON.parse(localStorage.getItem("openKeys") || "[]");
    setOpenKeys(keys);
  }, []);
  return (
    <div className="left-container">
      <div className="logo">
        {/* <img src={Logo} alt="logo" /> */}
        <div>
          <img src={AddLogo} className="add" alt="添加" onClick={() => setShowAddModal(true)} />
          <img src={ThemeLogo} className="setting" alt="主题" onClick={switchTheme} />
          <img
            className="clear-all"
            src={ClearLogo}
            alt="清除所有"
            onClick={() => setShowModal(true)}
          />
        </div>
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
          openKeys={openKeys}
          onOpenChange={openChangeHandle}
          mode="inline"
          theme="dark"
          onSelect={selectHandle}
          defaultSelectedKeys={[index]}
        >
          {filterHistoryTitles.map((title, index: number) => {
            const thisHistory = filterHistory.filter(
              (item) => item.request.scheme + "://" + item.request.host === title
            );
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
        <img src={Logo} alt="logo" className="logo-img" />
        <img src={GithubLogo} alt="github" className="github-img" />
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
      <Modal
        title="新建请求"
        visible={showAddModal}
        okText="确定"
        cancelText="取消"
        onCancel={() => setShowAddModal(false)}
        onOk={addRequestHandle}
      >
        <Input
          placeholder="请输入需要监听的url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        ></Input>
      </Modal>
    </div>
  );
}

export default observer(LeftArea);
