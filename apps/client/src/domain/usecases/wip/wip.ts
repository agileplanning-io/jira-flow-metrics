import { range } from "rambda";
import { Issue } from "@agileplanning-io/flow-metrics";
import { addDays, differenceInDays } from "date-fns";
import { Interval } from "@agileplanning-io/flow-lib";

export type CalculateWipParams = {
  issues: Issue[];
  range: Interval;
};

export type WipResult = {
  date: Date;
  count: number;
  issues: Issue[];
}[];

export const calculateWip = ({
  issues,
  range: dateRange,
}: CalculateWipParams): WipResult => {
  if (!dateRange) {
    return [];
  }

  const dates = range(0, differenceInDays(dateRange.end, dateRange.start)).map(
    (index) => addDays(dateRange.start, index),
  );

  const result: WipResult = dates.map((date) => {
    const inProgress = issues.filter((issue) => {
      return (
        issue.metrics.started &&
        issue.metrics.started < date &&
        (!issue.metrics.completed || issue.metrics.completed > date)
      );
    });
    const count = inProgress.length;
    return {
      date,
      count,
      issues: inProgress,
    };
  });

  return result;
};
