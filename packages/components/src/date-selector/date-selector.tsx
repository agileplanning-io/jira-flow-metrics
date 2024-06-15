import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Space } from "antd";
import { DatePicker } from "./date-picker";
import { useState } from "react";
import { Interval } from "@agileplanning-io/flow-lib";
import { getDateRanges } from "./ranges";
import { endOfDay } from "date-fns";

export type DateSelectorProps = {
  dates?: Interval;
  onChange: (dates: Interval) => void;
};

export const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  onChange,
}) => {
  const [{ items, ranges }] = useState(() => getDateRanges());
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Form.Item noStyle>
        <Dropdown
          menu={{
            items,
            onClick: (info) => {
              const range = ranges[info.key];
              onChange({ start: range[0], end: range[1] });
            },
          }}
        >
          <Button icon={<CalendarOutlined />}>
            <DownOutlined />
          </Button>
        </Dropdown>
      </Form.Item>
      <Form.Item style={{ width: "100%", margin: 0 }}>
        <DatePicker.RangePicker
          suffixIcon={false}
          style={{ width: "100%" }}
          allowClear={false}
          value={dates ? [dates.start, dates.end] : undefined}
          onChange={(range) => {
            if (range) {
              const [start, end] = range;
              if (start && end) {
                onChange({ start, end: endOfDay(end) });
              }
            }
          }}
        />
      </Form.Item>
    </Space.Compact>
  );
};
