import { CaretDownOutlined } from "@ant-design/icons";
import { Dropdown as AntDropdown, Button } from "antd";
import { MenuItemType } from "antd/es/menu/interface";

export type DropdownItemType<T> = MenuItemType & {
  key: T;
};

export type DropdownProps<T extends React.Key = React.Key> = {
  items: DropdownItemType<T>[];
  selectedKey?: T;
  onItemSelected?: (itemKey: T) => void;
};

export const Dropdown = <T extends React.Key>({
  items,
  selectedKey,
  onItemSelected,
}: DropdownProps<T>) => {
  const selectedItem = items?.find((item) => item?.key === selectedKey);

  return (
    <AntDropdown
      menu={{
        items,
        onClick: (e) => onItemSelected?.(e.key as T),
      }}
      trigger={["click"]}
    >
      <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
        {selectedItem?.label}
      </Button>
    </AntDropdown>
  );
};
