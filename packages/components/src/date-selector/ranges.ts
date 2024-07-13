import { Interval, TimeUnit } from "@agileplanning-io/flow-lib";
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

export type DateRangeOption = {
  label: string;
  key: string;
  range: Interval;
};

type DateRangeOptionGroup = {
  label: string;
  key: string;
  children: DateRangeOption[];
};

type DateRangeMenuOptions = {
  items: DateRangeOptionGroup[];
  ranges: {
    [key: string]: Interval;
  };
};

const getRelativeDateRange = (count: number, now: Date): DateRangeOption => {
  const label = `${count} ${count === 1 ? "day" : "days"} ago`;
  return {
    label,
    key: `relative_${count}_days`,
    range: { end: endOfDay(now), unit: TimeUnit.Day, unitCount: count },
  };
};

const getAbsoluteDateRange = (count: number, now: Date): DateRangeOption => {
  const start = addDays(now, -count);
  const label = `Last ${count} ${count === 1 ? "day" : "days"}`;
  return {
    label,
    key: `absolute_${count}_days`,
    range: { start, end: endOfDay(now) },
  };
};

const getCalendarRange = (
  prevCount: number,
  unit: "week" | "month",
  now: Date,
): DateRangeOption => {
  const startOfUnit = unit === "week" ? startOfWeek(now) : startOfMonth(now);
  const addUnits = unit === "week" ? addWeeks : addMonths;
  const range: Interval =
    prevCount === 0
      ? { start: startOfUnit, end: endOfDay(now) }
      : {
          start: addUnits(startOfUnit, -prevCount),
          end: endOfDay(subDays(startOfUnit, 1)),
        };
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

export const getDateRanges = (): DateRangeMenuOptions => {
  const now = startOfDay(new Date());

  const relativeItems = [
    ...[7, 14, 30, 90, 180].map((count) => getRelativeDateRange(count, now)),
  ];

  const absoluteItems = [
    ...[7, 14, 30, 90, 180].map((count) => getAbsoluteDateRange(count, now)),
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
      label: "Absolute",
      key: "absolute",
      children: absoluteItems,
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
    [
      ...relativeItems,
      ...absoluteItems,
      ...calendarWeekItems,
      ...calendarMonthItems,
    ].map((item) => [item.key, item.range]),
  );

  return {
    items,
    ranges,
  };
};
