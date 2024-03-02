import { getPercentiles } from "./percentiles";

describe("excludeOutliersFromSeq", () => {
  it("returns percentiles for the given quantiles", () => {
    const values = [1, 1, 2, 2.5, 3, 3.5, 4, 6, 9];
    const quantiles = [0.25, 0.5, 0.75];

    const percentiles = getPercentiles(values, quantiles);

    expect(percentiles).toEqual([
      { percentile: 75, value: 4 },
      { percentile: 50, value: 3 },
      { percentile: 25, value: 2 },
    ]);
  });
});
