import { CaretDownOutlined, CloseCircleFilled } from "@ant-design/icons";
import { grey } from "@ant-design/colors";
import { Dropdown as AntDropdown, Button, Typography } from "antd";
import { MenuItemType } from "antd/es/menu/interface";
import { useState } from "react";

export type DropdownItemType<T> = MenuItemType & {
  key: T;
};

type BaseDropdownProps<T extends React.Key> = {
  items: DropdownItemType<T>[];
  selectedKey?: T;
  onItemSelected?: (itemKey: T) => void;
  allowClear?: boolean;
};

type ClearableDropdownProps<T extends React.Key> = BaseDropdownProps<T> & {
  allowClear: true;
  onItemSelected?: (itemKey?: T) => void;
};

type RequiredDropdownProps<T extends React.Key> = BaseDropdownProps<T> & {
  allowClear?: false;
  onItemSelected?: (itemKey: T) => void;
};

export type DropdownProps<T extends React.Key = React.Key> =
  | ClearableDropdownProps<T>
  | RequiredDropdownProps<T>;

export const Dropdown = <T extends React.Key>({
  items,
  selectedKey,
  onItemSelected,
  allowClear,
}: DropdownProps<T>) => {
  const selectedItem = items?.find((item) => item?.key === selectedKey);

  const [mouseOver, setMouseOver] = useState(false);

  return (
    <AntDropdown
      menu={{
        items,
        onClick: (e) => onItemSelected?.(e.key as T),
      }}
      trigger={["click"]}
    >
      <Button
        size="small"
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        icon={
          allowClear && mouseOver ? (
            <CloseCircleFilled
              style={{ color: grey[0] }}
              onClick={() => onItemSelected?.(undefined)}
            />
          ) : (
            <CaretDownOutlined />
          )
        }
        iconPosition="end"
      >
        {selectedItem?.label ?? (
          <Typography.Text type="secondary">None</Typography.Text>
        )}
      </Button>
    </AntDropdown>
  );
};
