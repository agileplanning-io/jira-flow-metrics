import { getPercentiles } from "./percentiles";

describe("getPercentiles", () => {
  it("returns the median percentile for small data sets", () => {
    const values = [1, 3, 5, 7, 9];
    const percentiles = getPercentiles(values);
    expect(percentiles).toEqual([{ percentile: 50, value: 5 }]);
  });

  it("returns up to 85th percentile for sets of 10 or more numbers", () => {
    const values = [0, 2, 4, 4, 5, 6, 7, 8, 8, 10];
    const percentiles = getPercentiles(values);
    expect(percentiles).toEqual([
      {
        percentile: 30,
        value: 4,
      },
      {
        percentile: 50,
        value: 5.5,
      },
      {
        percentile: 70,
        value: 7.3,
      },
      {
        percentile: 85,
        value: 8,
      },
    ]);
  });

  it("returns up to 95th percentile for sets of 20 or more numbers", () => {
    const values = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    const percentiles = getPercentiles(values);
    expect(percentiles).toEqual([
      {
        percentile: 30,
        value: 6,
      },
      {
        percentile: 50,
        value: 10,
      },
      {
        percentile: 70,
        value: 14,
      },
      {
        percentile: 85,
        value: 17,
      },
      {
        percentile: 95,
        value: 19,
      },
    ]);
  });
});
