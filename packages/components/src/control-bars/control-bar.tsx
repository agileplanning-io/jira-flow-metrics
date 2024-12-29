import { Flex } from "antd";
import { FC, PropsWithChildren } from "react";

export const ControlBar: FC<PropsWithChildren> = ({ children }) => (
  <Flex
    justify="flex-start"
    align="flex-end"
    gap="small"
    style={{
      width: "100%",
      padding: "0 0 16px 0",
      borderRadius: 8,
    }}
  >
    {children}
  </Flex>
);
