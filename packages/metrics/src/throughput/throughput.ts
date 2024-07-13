import { range } from "remeda";
import {
  AbsoluteInterval,
  Percentile,
  TimeUnit,
  addTime,
  difference,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import { CompletedIssue } from "../issues";

export type CalculateThroughputParams = {
  issues: CompletedIssue[];
  interval: AbsoluteInterval;
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

  const percentiles = getPercentiles(data.map((d) => d.count));

  return {
    data,
    percentiles,
  };
};
