import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Space } from "antd";
import { useMemo } from "react";
import { Interval, isAbsolute } from "@agileplanning-io/flow-lib";
import { getDateRanges } from "./ranges";
import { AbsoluteRangePicker } from "./absolute-range-picker";
import { RelativeRangePicker } from "./relative-range-picker";

export type DateSelectorProps = {
  dates?: Interval;
  onChange: (dates: Interval) => void;
};

export const RangePicker: React.FC<DateSelectorProps> & {
  Absolute: typeof AbsoluteRangePicker;
  Relative: typeof RelativeRangePicker;
} = ({ dates, onChange }) => {
  const { items, ranges } = useMemo(() => getDateRanges(), [getDateRanges]);

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Form.Item noStyle>
        <Dropdown
          menu={{
            items,
            onClick: (info) => {
              const range = ranges[info.key];
              onChange(range);
            },
          }}
        >
          <Button icon={<CalendarOutlined />}>
            <DownOutlined />
          </Button>
        </Dropdown>
      </Form.Item>
      <Form.Item style={{ width: "100%", margin: 0 }}>
        {!dates ? null : isAbsolute(dates) ? (
          <AbsoluteRangePicker dates={dates} onChange={onChange} />
        ) : (
          <RelativeRangePicker dates={dates} onChange={onChange} />
        )}
      </Form.Item>
    </Space.Compact>
  );
};

RangePicker.Absolute = AbsoluteRangePicker;
RangePicker.Relative = RelativeRangePicker;
