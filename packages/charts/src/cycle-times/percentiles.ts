import { CompletedIssue } from "@agileplanning-io/flow-metrics";
import { Percentile, getPercentiles } from "@agileplanning-io/flow-lib";

export const getCycleTimePercentiles = (
  issues: CompletedIssue[],
): Percentile[] | undefined => {
  const cycleTimes = issues.map((item) => item.metrics.cycleTime);

  const quantiles =
    cycleTimes.length >= 20
      ? [0.5, 0.7, 0.85, 0.95]
      : cycleTimes.length >= 10
      ? [0.5, 0.7, 0.85]
      : cycleTimes.length >= 5
      ? [0.5]
      : [];

  return getPercentiles(cycleTimes, quantiles);
};

export const getColorForPercentile = (percentile: number): string => {
  if (percentile <= 50) {
    return "#03a9f4";
  }

  if (percentile <= 70) {
    return "#ff9800";
  }

  return "#f44336";
};
