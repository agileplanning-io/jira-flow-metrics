import { range } from "remeda";
import { addDays, differenceInDays } from "date-fns";
import {
  Interval,
  Percentile,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import { Issue } from "../types";

export type CalculateWipParams = {
  issues: Issue[];
  range: Interval;
};

type WipDatum = {
  date: Date;
  count: number;
  issues: Issue[];
};

export type WipResult = {
  data: WipDatum[];
  percentiles: Percentile[];
};

export const calculateWip = ({
  issues,
  range: dateRange,
}: CalculateWipParams): WipResult => {
  const dates = range(0, differenceInDays(dateRange.end, dateRange.start)).map(
    (index) => addDays(dateRange.start, index),
  );

  const data: WipDatum[] = dates.map((date) => {
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

  const percentiles = getWipPercentiles(data);

  return {
    data,
    percentiles,
  };
};

const getWipPercentiles = (data: WipDatum[]): Percentile[] => {
  const counts = data.map((item) => item.count);

  const quantiles =
    counts.length > 20
      ? [0.15, 0.3, 0.5, 0.7, 0.85]
      : counts.length > 10
      ? [0.3, 0.5, 0.7]
      : counts.length >= 5
      ? [0.5]
      : [];

  const percentiles = getPercentiles(counts, quantiles);

  return percentiles;
};
