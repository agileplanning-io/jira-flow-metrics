import { CaretDownOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { ReactNode, useState } from "react";
import { clone } from "remeda";

type PopdownProps<T> = {
  title: string;
  children: (value: T, setValue: (value: T) => void) => ReactNode;
  value: T;
  renderLabel: (value: T) => ReactNode;
  onValueChanged: (value: T) => void;
};

export const Popdown = <T,>({
  title,
  children,
  value,
  renderLabel,
  onValueChanged,
}: PopdownProps<T>) => {
  const [state, setState] = useState(value);
  return (
    <Popconfirm
      title={title}
      icon={null}
      description={children(state, setState)}
      onConfirm={() => onValueChanged(state)}
      placement="bottom"
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
