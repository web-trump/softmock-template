import { observer } from "mobx-react";
import { toJS } from "mobx";
import React, { useState, useEffect } from "react";
import { Table, Switch, Button, Tabs, Input, Tag, notification, Empty } from "antd";

import store from "../store";
import RequestHeader from "./components/RequestHeader";
import RequestCookie from "./components/RequestCookie";
import ResponseHeader from "./components/ResponseHeader";
import ResponseBody from "./components/ResponseBody";
import ResponseTs from "./components/ResponseTs";
import "./index.less";

interface Item {
  title: string;
  value: string;
}
const { TabPane } = Tabs;

function RightArea() {
  const {
    currentRequest,
    currentRequestHeader,
    currentResponseHeader,
    codeMode,
    currentUrl,
    history,
    updateCurrentRequest,
    Delete,
  } = store;
  const [isListen, setIsListen] = useState<boolean>(false);
  const showNotification = async () => {
    await Delete();
    notification.info({
      message: "删除成功",
      description: currentUrl,
    });
  };
  const changeListen = async (value: boolean) => {
    currentRequest.status = value ? "1" : "0";
    setIsListen(value);
    updateCurrentRequest({ ...currentRequest });
  };
  useEffect(() => {
    setIsListen(+currentRequest?.status === 1);
  }, [currentRequest]);
  const Title = (
    <div className="title">
      <Switch
        checkedChildren="监听"
        unCheckedChildren="关闭"
        checked={isListen}
        onClick={changeListen}
      />
      <div
        style={{
          width: "8px",
        }}
      ></div>
      <Button type="primary" danger shape="round" size="small" onClick={showNotification}>
        删除
      </Button>
    </div>
  );
  const tabChangeHandle = (key: any) => {
    console.log("key", key);
  };

  return (
    <>
      <div
        className="empty"
        style={{
          display: history.length ? "none" : "",
        }}
      >
        <Empty />
      </div>
      <div
        className="right-container"
        style={{
          display: history.length ? "" : "none",
        }}
      >
        <div className="header-container">
          <Tabs defaultActiveKey="1" onChange={tabChangeHandle}>
            <TabPane tab="请求头" key="1">
              <RequestHeader dataSource={currentRequestHeader.headers} />
            </TabPane>
            <TabPane tab="请求体" key="2">
              Content of Tab Pane 2
            </TabPane>
            <TabPane tab="请求体-TypeScript" key="3">
              Content of Tab Pane 2
            </TabPane>
            <TabPane tab="Cookies" key="4">
              <RequestCookie cookies={currentRequestHeader.cookies}></RequestCookie>
            </TabPane>
          </Tabs>
        </div>
        <div className="content-container">
          <Tabs defaultActiveKey="1" tabBarExtraContent={Title}>
            <TabPane
              tab={
                <div>
                  <Tag color="#2db7f5">{codeMode}</Tag>
                  返回体
                </div>
              }
              key="1"
            >
              <ResponseBody />
            </TabPane>
            <TabPane
              tab={
                <>
                  <Tag color="#108ee9">TS</Tag>返回体
                </>
              }
              key="2"
            >
              <ResponseTs></ResponseTs>
            </TabPane>
            <TabPane
              tab={
                <>
                  <Tag color="#87d068">header</Tag>返回头
                </>
              }
              key="3"
            >
              <ResponseHeader dataSource={currentResponseHeader.headers}></ResponseHeader>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default observer(RightArea);
