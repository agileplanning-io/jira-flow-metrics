import { Typography } from "antd";
import React, { FC, PropsWithChildren } from "react";

type FormControlProps = {
  label: React.ReactNode;
} & PropsWithChildren;

export const FormControl: FC<FormControlProps> = ({ label, children }) => {
  return (
    <span style={{ whiteSpace: "normal" }}>
      <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
        {label}{" "}
      </Typography.Text>
      <wbr />
      {children}
    </span>
  );
};
