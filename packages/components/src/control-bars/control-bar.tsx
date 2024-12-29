import { Space } from "antd";
import { FC, PropsWithChildren } from "react";

export const ControlBar: FC<PropsWithChildren> = ({ children }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    <Space
      direction="horizontal"
      style={{
        width: "100%",
        padding: 8,
        borderRadius: 8,
      }}
    >
      {children}
    </Space>
  </Space>
);
