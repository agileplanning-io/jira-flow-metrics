import { range } from "rambda";
import { quantileSeq } from "mathjs";
import { CompletedIssue } from "@agileplanning-io/flow-metrics";
import {
  Interval,
  TimeUnit,
  addTime,
  difference,
} from "@agileplanning-io/flow-lib";

export type CalculateThroughputParams = {
  issues: CompletedIssue[];
  interval: Interval;
  timeUnit: TimeUnit;
};

export type Percentile = {
  percentile: number;
  throughput: number;
  color: string;
  dashed: boolean;
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

  const percentiles = getPercentiles(data);

  return {
    data,
    percentiles,
  };
};

const getPercentiles = (data: ThroughputDatum[]): Percentile[] => {
  const throughputCounts = data.map((item) => item.count);

  const quantiles =
    throughputCounts.length > 20
      ? [0.15, 0.3, 0.5, 0.7, 0.85]
      : throughputCounts.length > 10
      ? [0.3, 0.5, 0.7]
      : throughputCounts.length >= 5
      ? [0.5]
      : [];

  const percentiles = quantiles.map((quantile) => {
    const percentile = quantile * 100;
    return {
      percentile,
      color: getColorForPercentile(percentile),
      dashed: ![15, 85].includes(percentile),
      throughput: Math.ceil(
        quantileSeq(throughputCounts, 1 - quantile) as number,
      ),
    };
  });

  return percentiles;
};

const getColorForPercentile = (percentile: number): string => {
  if (percentile >= 70) {
    return "#03a9f4";
  }

  if (percentile >= 50) {
    return "#ff9800";
  }

  return "#f44336";
};
