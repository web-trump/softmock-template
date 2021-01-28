import React, { useState } from "react";
import { Table, Input, Button } from "antd";

import "./index.less";

interface Props {
  dataSource: any;
}

export default function RequestHeader(props: Props) {
  const { dataSource } = props;
  const [editCell, setEditCell] = useState({
    record: null,
    index: 0,
  });
  const onMouseEnter = (record: any, index: number) => {
    setEditCell({ record, index });
  };
  const onTextChange = (e: any) => {
    console.log(e);
  };
  const columns = [
    {
      title: "key",
      dataIndex: "title",
      key: "title",
      width: "40%",
      render(text: string, record: any, index: number) {
        if (record === editCell.record && index === editCell.index) {
          return <Input defaultValue={text} size="middle" onChange={onTextChange}></Input>;
        } else {
          return (
            <div onMouseEnter={() => onMouseEnter(record, index)} className="one-row">
              {text}
            </div>
          );
        }
      },
    },
    {
      title: "value",
      dataIndex: "value",
      width: "40%",
      key: "value",
      render(text: string, record: any, index: number) {
        if (record === editCell.record && index === editCell.index) {
          return <Input defaultValue={text} size="middle" onChange={onTextChange}></Input>;
        } else {
          return (
            <div onMouseEnter={() => onMouseEnter(record, index)} className="one-row">
              {text}
            </div>
          );
        }
      },
    },
    {
      title: "操作",
      dataIndex: "operate",
      width: "20%",
      key: "operate",
      render() {
        return <Button type="link">删除</Button>;
      },
    },
  ];
  return (
    <>
      <div className="add-container">
        <Input placeholder="筛选..."></Input>
        <Button size="small">添加</Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        sticky={true}
        size="small"
        bordered={true}
        rowKey={() => Math.random().toString()}
      ></Table>
    </>
  );
}
