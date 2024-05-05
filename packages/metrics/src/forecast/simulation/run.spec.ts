import { SimulationInputs, getDayOfWeek, runSimulation, runOnce } from "./run";
import { summarize } from "../forecast";
import { getISODay } from "date-fns";
import { FakeRandomGenerator } from "../../fixtures/fake-random-generator";

describe("run", () => {
  describe("getDayOfWeek", () => {
    it("returns the day of week", () => {
      // starting on a Monday
      expect(getDayOfWeek(0, 1)).toEqual(1);
      expect(getDayOfWeek(6, 1)).toEqual(7);
      expect(getDayOfWeek(7, 1)).toEqual(1);
      expect(getDayOfWeek(8, 1)).toEqual(2);
      expect(getDayOfWeek(13, 1)).toEqual(7);
      expect(getDayOfWeek(14, 1)).toEqual(1);

      // starting on a Tuesday
      expect(getDayOfWeek(0, 2)).toEqual(2);
      expect(getDayOfWeek(5, 2)).toEqual(7);
      expect(getDayOfWeek(6, 2)).toEqual(1);

      // starting on a Sunday
      expect(getDayOfWeek(0, 7)).toEqual(7);
      expect(getDayOfWeek(1, 7)).toEqual(1);
    });
  });

  describe("runOnce", () => {
    it("runs the MCS once", () => {
      const measurements: SimulationInputs = {
        cycleTimes: [2.5, 3.5, 5.5],
        throughputs: {
          weekend: [0],
          weekday: [1, 2],
        },
      };
      const startWeekday = 1;

      const generator = new FakeRandomGenerator([
        1, // cycle time sample (3.5)
        0, // throughput sample #1
        0, // throughput sample #2
        0, // throughput sample #3
        1, // throughput sample #4
        1, // throughput sample #5
      ]);

      // time | th. |   day   | backlog count
      // 3.5  |  -  | 4 (Thu) |  5  - cycle time sample is 3.5 days
      // 4.5  |  1  | 5 (Fri) |  4  - throughput sample #1
      // 4.5  |  0  | 6 (Sat) |  4  - throughput sample #2
      // 5.5  |  0  | 7 (Sun) |  4  - throughput sample #3
      // 6.5  |  2  | 1 (Mon) |  2  - throughput sample #4
      // 7.5  |  2  | 2 (Mon) |  0  - throughput sample #5
      expect(
        runOnce({
          issueCount: 5,
          inputs: measurements,
          startWeekday,
          includeLeadTimes: true,
          generator,
        }),
      ).toEqual(7.5);
    });

    it("ignores lead times if includeLeadTimes is false", () => {
      const measurements: SimulationInputs = {
        cycleTimes: [2.5, 3.5, 5.5],
        throughputs: {
          weekend: [0],
          weekday: [1, 2],
        },
      };
      const startWeekday = 1;

      const generator = new FakeRandomGenerator([
        1, // throughput sample #1
        0, // throughput sample #2
        0, // throughput sample #3
        0, // throughput sample #4
      ]);

      // time | th. |   day   | backlog count
      //   1  |  2  | 1 (Mon) |  3  - throughput sample #1
      //   2  |  1  | 2 (Tue) |  2  - throughput sample #2
      //   3  |  1  | 3 (Wed) |  1  - throughput sample #3
      //   4  |  1  | 4 (Thu) |  0  - throughput sample #4
      expect(
        runOnce({
          issueCount: 5,
          inputs: measurements,
          startWeekday,
          includeLeadTimes: false,
          generator,
        }),
      ).toEqual(4);
    });
  });

  describe("run", () => {
    it("returns results for `runCount` runs of the simulation", () => {
      const measurements: SimulationInputs = {
        cycleTimes: [2.5, 3.5, 5.5],
        throughputs: {
          weekend: [0],
          weekday: [1, 2],
        },
      };
      const startDate = new Date("2020-01-06T00:00:00.000Z");

      const generator = new FakeRandomGenerator([
        1, // cycle time sample #1 (3.5)
        0, // throughput sample #1
        0, // throughput sample #2
        0, // throughput sample #3
        1, // throughput sample #4
        1, // throughput sample #5
        1, // cycle time sample #2 (3.5)
        0, // throughput sample #1
        0, // throughput sample #2
        0, // throughput sample #3
        1, // throughput sample #4
        0, // throughput sample #5
        0, // throughput sample #6
      ]);
      expect(
        runSimulation({
          issueCount: 5,
          inputs: measurements,
          runCount: 2,
          startWeekday: getISODay(startDate),
          includeLeadTimes: true,
          generator,
        }),
      ).toEqual([7.5, 8.5]);
    });
  });

  describe("summarize", () => {
    it("returns data for a histogram of durations", () => {
      const startDate = new Date("2020-01-01T00:00:00.000Z");
      const summary = summarize([1, 3, 10, 5, 9, 5, 3, 5], startDate, false);
      expect(summary).toEqual({
        startDate,
        percentiles: [{ percentile: 50, value: 5 }],
        rows: [
          {
            time: new Date("2020-01-02T00:00:00.000Z"),
            count: 1,
            cumulativeCount: 1,
            startQuantile: 0,
            endQuantile: 0.125,
          },
          {
            time: new Date("2020-01-04T00:00:00.000Z"),
            count: 2,
            cumulativeCount: 3,
            startQuantile: 0.125,
            endQuantile: 0.375,
          },
          {
            time: new Date("2020-01-06T00:00:00.000Z"),
            count: 3,
            cumulativeCount: 6,
            startQuantile: 0.375,
            endQuantile: 0.75,
          },
          {
            time: new Date("2020-01-10T00:00:00.000Z"),
            count: 1,
            cumulativeCount: 7,
            startQuantile: 0.75,
            endQuantile: 0.875,
          },
          {
            time: new Date("2020-01-11T00:00:00.000Z"),
            count: 1,
            cumulativeCount: 8,
            startQuantile: 0.875,
            endQuantile: 1,
          },
        ],
      });
    });
  });
});
