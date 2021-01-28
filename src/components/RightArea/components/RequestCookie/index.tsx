import React, { useState, useMemo } from "react";
import { Table, Input, Button } from "antd";

import "./index.less";

interface Props {
  cookies: string;
}

function parseCookie(cookies: string) {
  const result: any = [];
  for (let cookie of cookies.split(";")) {
    const [title, value] = cookie.split("=");
    result.push({
      title: title?.trim(),
      value: value?.trim(),
    });
  }
  return result;
}

export default function RequestHeader(props: Props) {
  const { cookies } = props;
  const dataSource = useMemo(() => {
    return parseCookie(cookies);
  }, [cookies]);
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
  const addHandle = () => {};
  const columns = [
    {
      title: "key",
      dataIndex: "title",
      key: "title",
      width: "40%",
      render(text: string, record: any, index: number) {
        console.log("editCell", editCell, "record", record, "index", index);
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
      key: "value",
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
      title: "操作",
      dataIndex: "operate",
      key: "operate",
      width: "20%",
      render() {
        return <Button type="link">删除</Button>;
      },
    },
  ];
  return (
    <>
      <div className="add-container">
        <Button size="small" onClick={addHandle}>
          添加
        </Button>
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
