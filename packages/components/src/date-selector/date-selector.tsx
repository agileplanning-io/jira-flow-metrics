import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  InputNumber,
  Select,
  SelectProps,
  Space,
} from "antd";
import { DatePicker } from "./date-picker";
import { FC, useMemo } from "react";
import {
  AbsoluteInterval,
  Interval,
  RelativeInterval,
  TimeUnit,
  isAbsolute,
} from "@agileplanning-io/flow-lib";
import { getDateRanges } from "./ranges";
import { endOfDay } from "date-fns";
import { isNumber } from "remeda";
import { SizeType } from "antd/es/config-provider/SizeContext";

export type DateSelectorProps = {
  dates?: Interval;
  onChange: (dates: Interval) => void;
};

export const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  onChange,
}) => {
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
          <AbsolutePicker dates={dates} onChange={onChange} />
        ) : (
          <RelativePicker dates={dates} onChange={onChange} />
        )}
      </Form.Item>
    </Space.Compact>
  );
};

export const AbsolutePicker: FC<{
  dates: AbsoluteInterval;
  onChange: (interval: AbsoluteInterval) => void;
  size?: SizeType;
}> = ({ dates, onChange, size }) => (
  <DatePicker.RangePicker
    size={size}
    suffixIcon={false}
    style={{ width: "100%", zIndex: 10000 }}
    allowClear={false}
    value={[dates.start, dates.end]}
    onChange={(range) => {
      if (range) {
        const [start, end] = range;
        if (start && end) {
          onChange({ start, end: endOfDay(end) });
        }
      }
    }}
  />
);

const timeUnitOptions: SelectProps["options"] = [
  TimeUnit.Day,
  TimeUnit.Week,
  TimeUnit.Fortnight,
  TimeUnit.Month,
].map((unit) => ({ label: `${unit}s ago`, value: unit }));

export const RelativePicker: FC<{
  dates: RelativeInterval;
  onChange: (interval: Interval) => void;
}> = ({ dates, onChange }) => {
  const select = (
    <Select
      style={{ width: "140px" }}
      options={timeUnitOptions}
      value={dates.unit}
      onChange={(unit) => onChange({ ...dates, unit })}
    />
  );
  return (
    <InputNumber
      type="number"
      addonAfter={select}
      style={{ width: "100%" }}
      value={dates.unitCount}
      onChange={(unitCount) => {
        if (isNumber(unitCount)) {
          onChange({ ...dates, unitCount });
        }
      }}
    />
  );
};
