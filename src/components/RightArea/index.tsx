import { observer } from "mobx-react";
import React, { useState, useEffect } from "react";
import { Table, Switch, Button, Tabs, Input, Tag, notification, Empty } from "antd";
import cls from "classnames";

import store from "../store";
import RequestHeader from "./components/RequestHeader";
import RequestCookie from "./components/RequestCookie";
import RequestBody from "./components/RequestBody";
import RequestTs from "./components/RequestTs";
import ResponseHeader from "./components/ResponseHeader";
import ResponseBody from "./components/ResponseBody";
import ResponseTs from "./components/ResponseTs";
import "./index.less";

const { TabPane } = Tabs;

function RightArea() {
  const {
    currentRequest,
    codeMode,
    currentRequestHeader,
    currentUrl,
    history,
    updateCurrentRequest,
    Delete,
  } = store;
  const [isListen, setIsListen] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<"1" | "2" | "3">("1");
  const [activeKeyReq, setActiveKeyReq] = useState<"1" | "2" | "3" | "4">("1");
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
      {fullScreen && <div className="current-url">{currentUrl}</div>}
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
      {fullScreen ? (
        <Button
          className="full-screen-btn"
          shape="round"
          size="small"
          onClick={() => setFullScreen(false)}
        >
          关闭全屏
        </Button>
      ) : (
        <Button
          className="full-screen-btn"
          shape="round"
          size="small"
          onClick={() => setFullScreen(true)}
        >
          全屏
        </Button>
      )}

      <Button type="primary" danger shape="round" size="small" onClick={showNotification}>
        删除
      </Button>
    </div>
  );
  const RequestTitle = (
    <div
      style={{
        color: "#999",
      }}
    >
      {currentUrl}
    </div>
  );
  const requestMethod = currentRequest.request?.method || "GET";
  const contentType =
    currentRequestHeader?.headers?.["content-type"] ||
    currentRequestHeader?.headers?.["Content-Type"] ||
    "/null";

  return (
    <>
      <div
        className="empty"
        style={{
          display: history.length && currentRequest?.request !== undefined ? "none" : "",
        }}
      >
        <Empty />
      </div>
      <div
        className="right-container"
        style={{
          display: history.length && currentRequest?.request !== undefined ? "" : "none",
        }}
      >
        <div className="header-container">
          <Tabs
            activeKey={activeKeyReq}
            tabBarExtraContent={RequestTitle}
            onChange={(value: any) => setActiveKeyReq(value)}
          >
            <TabPane
              tab={
                <>
                  <Tag color="#108ee9">{requestMethod}</Tag>请求头
                </>
              }
              key="1"
            />
            {requestMethod === "POST" && (
              <TabPane
                tab={
                  <>
                    <Tag color="#108ee9">{contentType.split(";")[0].split("/")[1]}</Tag>请求体
                  </>
                }
                key="2"
              />
            )}
            {requestMethod === "POST" && (
              <TabPane
                tab={
                  <>
                    <Tag color="#108ee9">TS</Tag>请求体
                  </>
                }
                key="3"
              />
            )}
            <TabPane tab="Cookies" key="4" />
          </Tabs>
          {activeKeyReq === "1" ? (
            <RequestHeader />
          ) : activeKeyReq === "2" ? (
            <RequestBody />
          ) : activeKeyReq === "3" ? (
            <RequestTs />
          ) : (
            <RequestCookie />
          )}
        </div>
        <div className={cls("content-container", { "full-screen": fullScreen })}>
          <Tabs
            activeKey={activeKey}
            tabBarExtraContent={Title}
            onChange={(value: any) => setActiveKey(value)}
          >
            <TabPane
              tab={
                <div>
                  <Tag color="#2db7f5">{codeMode}</Tag>
                  返回体
                </div>
              }
              key="1"
            ></TabPane>
            {codeMode === "json" && (
              <TabPane
                tab={
                  <>
                    <Tag color="#108ee9">TS</Tag>返回体
                  </>
                }
                key="2"
              ></TabPane>
            )}
            <TabPane
              tab={
                <>
                  <Tag color="#87d068">header</Tag>返回头
                </>
              }
              key="3"
            ></TabPane>
          </Tabs>
          {activeKey === "1" ? (
            <ResponseBody />
          ) : activeKey === "2" ? (
            <ResponseTs></ResponseTs>
          ) : (
            <ResponseHeader />
          )}
        </div>
      </div>
    </>
  );
}

export default observer(RightArea);
