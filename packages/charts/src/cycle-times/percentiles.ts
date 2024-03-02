import { quantileSeq } from "mathjs";
import { CompletedIssue } from "@agileplanning-io/flow-metrics";

export type Percentile = {
  percentile: number;
  cycleTime: number;
};

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

  const percentiles = quantiles
    .map((quantile) => {
      const percentile = quantile * 100;
      return {
        percentile,
        cycleTime: quantileSeq(cycleTimes, quantile) as number,
      };
    })
    .reverse();

  return percentiles.length > 0 ? percentiles : undefined;
};
