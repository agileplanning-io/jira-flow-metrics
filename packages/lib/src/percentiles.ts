import { quantileSeq } from "mathjs";

export type Percentile = {
  percentile: number;
  value: number;
};

export const getPercentiles = (values: number[], quantiles: number[]) => {
  const percentiles = quantiles
    .map((quantile) => {
      const percentile = quantile * 100;
      return {
        percentile,
        value: quantileSeq(values, quantile) as number,
      };
    })
    .reverse();

  return percentiles.length > 0 ? percentiles : undefined;
};
