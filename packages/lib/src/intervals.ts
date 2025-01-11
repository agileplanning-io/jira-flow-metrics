import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  max,
  min,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { clone, sortBy } from "remeda";

export enum TimeUnit {
  Day = "day",
  Week = "week",
  Fortnight = "fortnight",
  Month = "month",
}

export type AbsoluteInterval = {
  start: Date;
  end: Date;
};

export type RelativeInterval = {
  unit: TimeUnit;
  unitCount: number;
};

export type Interval = AbsoluteInterval | RelativeInterval;

export const isAbsolute = (interval: Interval): interval is AbsoluteInterval =>
  "start" in interval;

export const asAbsolute = (
  interval: Interval,
  now: Date = new Date(),
): AbsoluteInterval => {
  if (isAbsolute(interval)) {
    return interval;
  }

  const start = addTime(now, -interval.unitCount, interval.unit);
  return { start, end: now };
};

const startOf = (date: Date, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return startOfDay(date);
    case TimeUnit.Week:
    case TimeUnit.Fortnight:
      return startOfWeek(date);
    case TimeUnit.Month:
      return startOfMonth(date);
  }
};

const endOf = (date: Date, start: Date, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return endOfDay(date);
    case TimeUnit.Week:
      return endOfWeek(date);
    case TimeUnit.Fortnight:
      return endOfWeek(
        addWeeks(start, Math.ceil(differenceInWeeks(date, start) / 2) * 2),
      );
    case TimeUnit.Month:
      return endOfMonth(date);
  }
};

export const getOverlappingInterval = (
  interval: AbsoluteInterval,
  unit: TimeUnit,
): AbsoluteInterval => {
  const start = startOf(interval.start, unit);
  const end = endOf(interval.end, start, unit);
  return { start, end };
};

export const getSpanningInterval = (
  interval1: AbsoluteInterval,
  interval2: AbsoluteInterval,
): AbsoluteInterval => {
  const start: Date = min([interval1.start, interval2.start]);
  const end: Date = max([interval1.end, interval2.end]);

  return { start, end };
};

export const getIntersectingInterval = (
  interval1: AbsoluteInterval,
  interval2: AbsoluteInterval,
): AbsoluteInterval | undefined => {
  if (interval1.end < interval2.start) {
    return undefined;
  }

  if (interval2.end < interval1.start) {
    return undefined;
  }

  const start: Date = max([interval1.start, interval2.start]);
  const end: Date = min([interval1.end, interval2.end]);

  return { start, end };
};

export const getSpanningSet = (
  intervals: AbsoluteInterval[],
): AbsoluteInterval[] => {
  const spans: AbsoluteInterval[] = [];
  const sortedIntervals = sortBy(intervals, (interval) =>
    interval.start.getTime(),
  );

  while (sortedIntervals.length > 0) {
    // the next span of contiguous intervals begins with the next interval
    let span = clone(sortedIntervals[0]);
    sortedIntervals.shift();

    while (sortedIntervals.length > 0) {
      const next = sortedIntervals[0];
      const nextOverlaps = getIntersectingInterval(span, next) !== undefined;

      if (nextOverlaps) {
        span = getSpanningInterval(span, next);
        sortedIntervals.shift();
      } else {
        break;
      }
    }

    spans.push(span);
  }

  return spans;
};

export const addTime = (date: Date, count: number, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return addDays(date, count);
    case TimeUnit.Week:
      return addWeeks(date, count);
    case TimeUnit.Fortnight:
      return addWeeks(date, count * 2);
    case TimeUnit.Month:
      return addMonths(date, count);
  }
};

export const difference = (
  dateLeft: Date,
  dateRight: Date,
  unit: TimeUnit,
): number => {
  switch (unit) {
    case TimeUnit.Day:
      return differenceInDays(dateLeft, dateRight);
    case TimeUnit.Week:
      return differenceInWeeks(dateLeft, dateRight);
    case TimeUnit.Fortnight:
      return differenceInWeeks(dateLeft, dateRight) / 2;
    case TimeUnit.Month:
      return differenceInMonths(dateLeft, dateRight);
  }
};

export const defaultDateRange = (): Interval => {
  const today = new Date();
  //const defaultStart = startOfDay(subDays(today, 30));
  const defaultEnd = endOfDay(today);
  return { end: defaultEnd, unit: TimeUnit.Day, unitCount: 30 };
};

export const containsDate = (interval: AbsoluteInterval, date: Date) => {
  return interval.start <= date && date <= interval.end;
};
