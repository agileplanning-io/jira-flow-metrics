import { Flex, Typography } from "antd";
import React, { FC, PropsWithChildren } from "react";

type FormControlProps = {
  label: React.ReactNode;
} & PropsWithChildren;

export const FormControl: FC<FormControlProps> = ({ label, children }) => {
  return (
    <Flex wrap justify="flex-start" align="flex-end" gap="small">
      <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography.Text>
      {children}
    </Flex>
  );
};
