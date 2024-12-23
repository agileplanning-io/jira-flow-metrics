import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { FC } from "react";

type HelpIconProps = {
  content: React.ReactNode;
};

export const HelpIcon: FC<HelpIconProps> = ({ content }) => (
  <Popover placement="bottom" content={content}>
    <a href="#">
      <QuestionCircleOutlined style={{ fontSize: 13 }} />
    </a>
  </Popover>
);
