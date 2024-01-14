import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Space } from "antd";
import { DatePicker } from "./date-picker";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { useState } from "react";
import { Interval } from "@jbrunton/flow-lib";

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
      <Form.Item style={{ width: "100%" }}>
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

type DateRangeOption = {
  label: string;
  key: string;
  range: [Date, Date];
};

type DateRangeOptionGroup = {
  label: string;
  key: string;
  children: DateRangeOption[];
};

type DateRangeMenuOptions = {
  items: DateRangeOptionGroup[];
  ranges: {
    [key: string]: [Date, Date];
  };
};

const getRelativeDateRange = (count: number, now: Date): DateRangeOption => {
  const start = addDays(now, -count);
  const label = `Last ${count} ${count === 1 ? "day" : "days"}`;
  return {
    label,
    key: `relative_${count}_days`,
    range: [start, endOfDay(now)],
  };
};

const getCalendarRange = (
  prevCount: number,
  unit: "week" | "month",
  now: Date,
): DateRangeOption => {
  const startOfUnit = unit === "week" ? startOfWeek(now) : startOfMonth(now);
  const addUnits = unit === "week" ? addWeeks : addMonths;
  const range: [Date, Date] =
    prevCount === 0
      ? [startOfUnit, endOfDay(now)]
      : [addUnits(startOfUnit, -prevCount), endOfDay(subDays(startOfUnit, 1))];
  const label =
    prevCount === 0
      ? `This ${unit}`
      : prevCount === 1
      ? `Last ${unit}`
      : `Last ${prevCount} ${unit}s`;
  return {
    label,
    key: `calendar_${prevCount}_${unit}`,
    range,
  };
};

const getDateRanges = (): DateRangeMenuOptions => {
  const now = startOfDay(new Date());

  const relativeItems = [
    ...[7, 14, 30, 90].map((count) => getRelativeDateRange(count, now)),
  ];

  const calendarWeekItems = [
    ...[0, 1, 2, 4, 8, 16].map((prevWeeks) =>
      getCalendarRange(prevWeeks, "week", now),
    ),
  ];

  const calendarMonthItems = [
    ...[0, 1, 3, 6, 12, 24].map((prevMonths) =>
      getCalendarRange(prevMonths, "month", now),
    ),
  ];

  const items = [
    {
      label: "Relative",
      key: "relative",
      children: relativeItems,
    },
    {
      label: "Calendar weeks",
      key: "calendar_weeks",
      children: calendarWeekItems,
    },
    {
      label: "Calendar months",
      key: "calendar_months",
      children: calendarMonthItems,
    },
  ];

  const ranges = Object.fromEntries(
    [...relativeItems, ...calendarWeekItems, ...calendarMonthItems].map(
      (item) => [item.key, item.range],
    ),
  );

  return {
    items,
    ranges,
  };
};
