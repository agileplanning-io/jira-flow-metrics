import { CompletedIssue } from "@agileplanning-io/flow-metrics";
import { Percentile, getPercentiles } from "@agileplanning-io/flow-lib";

export const getCycleTimePercentiles = (
  issues: CompletedIssue[],
): Percentile[] | undefined => {
  const cycleTimes = issues.map((item) => item.metrics.cycleTime);

  const quantiles =
    cycleTimes.length >= 20
      ? [0.05, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95]
      : cycleTimes.length >= 10
      ? [0.15, 0.3, 0.5, 0.7, 0.85]
      : cycleTimes.length >= 5
      ? [0.5]
      : [];

  return getPercentiles(cycleTimes, quantiles);
};
