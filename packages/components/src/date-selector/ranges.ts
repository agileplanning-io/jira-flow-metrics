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

export const getDateRanges = (): DateRangeMenuOptions => {
  const now = startOfDay(new Date());

  const relativeItems = [
    ...[7, 14, 30, 90, 180].map((count) => getRelativeDateRange(count, now)),
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
