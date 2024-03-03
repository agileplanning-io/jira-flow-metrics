import { range } from "remeda";
import {
  Interval,
  Percentile,
  TimeUnit,
  addTime,
  difference,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import { CompletedIssue } from "../types";

export type CalculateThroughputParams = {
  issues: CompletedIssue[];
  interval: Interval;
  timeUnit: TimeUnit;
};

type ThroughputDatum = {
  date: Date;
  count: number;
  issues: CompletedIssue[];
};

export type ThroughputResult = {
  data: ThroughputDatum[];
  percentiles: Percentile[];
};

export const calculateThroughput = ({
  issues,
  interval: { start, end },
  timeUnit,
}: CalculateThroughputParams): ThroughputResult => {
  const intervals = range(
    0,
    Math.floor(difference(end, start, timeUnit)) + 1,
  ).map((index) => ({
    start: addTime(start, index, timeUnit),
    end: addTime(start, index + 1, timeUnit),
  }));

  const data = intervals.map(({ start, end }) => {
    const intervalIssues = issues.filter(
      (issue) =>
        start <= issue.metrics.completed && issue.metrics.completed < end,
    );

    return {
      date: start,
      count: intervalIssues.length,
      issues: intervalIssues,
    };
  });

  const percentiles = getThroughputPercentiles(data);

  return {
    data,
    percentiles,
  };
};

const getThroughputPercentiles = (data: ThroughputDatum[]): Percentile[] => {
  const throughputCounts = data.map((item) => item.count);

  const quantiles =
    throughputCounts.length > 20
      ? [0.15, 0.3, 0.5, 0.7, 0.85]
      : throughputCounts.length > 10
      ? [0.3, 0.5, 0.7]
      : throughputCounts.length >= 5
      ? [0.5]
      : [];

  const percentiles = getPercentiles(throughputCounts, quantiles);

  return percentiles;
};
