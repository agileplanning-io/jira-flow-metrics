import { CaretDownOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { FC, ReactNode, useState } from "react";
import { clone } from "remeda";

type PopdownProps<T> = {
  title: string;
  content: (value: T, setValue: (value: T) => void) => ReactNode;
  value: T;
  renderLabel: (value: T) => ReactNode;
  onValueChanged: (value: T) => void;
};

export const Popdown = <T,>({
  title,
  content,
  value,
  renderLabel,
  onValueChanged,
}: PopdownProps<T>) => {
  const [state, setState] = useState(value);
  return (
    <Popconfirm
      title={title}
      icon={null}
      description={content(state, setState)}
      onConfirm={() => onValueChanged(state)}
      onOpenChange={(open) => {
        if (open) {
          setState(clone(value));
        }
      }}
    >
      <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
        {renderLabel(value)}
      </Button>
    </Popconfirm>
  );
};
