import { quantileSeq } from "mathjs";

export type Percentile = {
  percentile: number;
  value: number;
};

export const getPercentiles = (values: number[]): Percentile[] => {
  const quantiles = getQuantiles(values);
  return quantiles.map((quantile) => {
    const percentile = quantile * 100;
    return {
      percentile,
      value: quantileSeq(values, quantile) as number,
    };
  });
};

export const getQuantiles = (data: unknown[]): number[] =>
  data.length >= 20
    ? [0.3, 0.5, 0.7, 0.85, 0.95]
    : data.length >= 10
    ? [0.3, 0.5, 0.7, 0.85]
    : data.length >= 5
    ? [0.5]
    : [];
