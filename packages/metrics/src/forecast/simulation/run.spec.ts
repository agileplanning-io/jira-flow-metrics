import { InputMeasurements, run, runOnce } from "./run";
import { summarize } from "../forecast";
import { getISODay } from "date-fns";

describe("runOnce", () => {
  it("runs the MCS once", () => {
    const measurements: InputMeasurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: {
        weekend: [0],
        weekday: [1, 2],
      },
    };
    const startWeekday = 1;

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(1); // throughput sample #5

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
        measurements,
        startWeekday,
        excludeLeadTimes: false,
        generator,
      }),
    ).toEqual(7.5);
  });

  it("ignores lead times if excludeLeadTimes is true", () => {
    const measurements: InputMeasurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: {
        weekend: [0],
        weekday: [1, 2],
      },
    };
    const startWeekday = 1;

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(0); // throughput sample #4

    // time | th. |   day   | backlog count
    //   1  |  2  | 1 (Mon) |  3  - throughput sample #1
    //   2  |  1  | 2 (Tue) |  2  - throughput sample #2
    //   3  |  1  | 3 (Wed) |  1  - throughput sample #3
    //   4  |  1  | 4 (Thu) |  0  - throughput sample #4
    expect(
      runOnce({
        issueCount: 5,
        measurements,
        startWeekday,
        excludeLeadTimes: true,
        generator,
      }),
    ).toEqual(4);
  });
});

describe("run", () => {
  it("returns results for `runCount` runs of the simulation", () => {
    const measurements: InputMeasurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: {
        weekend: [0],
        weekday: [1, 2],
      },
    };
    const startDate = new Date("2020-01-06T00:00:00.000Z");

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample #1 (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(1) // throughput sample #5
      .mockReturnValueOnce(1) // cycle time sample #2 (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(0) // throughput sample #5
      .mockReturnValueOnce(0); // throughput sample #6
    expect(
      run({
        issueCount: 5,
        measurements,
        runCount: 2,
        startWeekday: getISODay(startDate),
        excludeLeadTimes: false,
        generator,
      }),
    ).toEqual([7.5, 8.5]);
  });
});

describe("summarize", () => {
  it("returns data for a histogram of durations", () => {
    const startDate = new Date("2020-01-01T00:00:00.000Z");
    const summary = summarize([1, 3, 10, 5, 9, 5, 3, 5], startDate, false);
    expect(summary).toEqual([
      {
        date: new Date("2020-01-02T00:00:00.000Z"),
        count: 1,
        annotation: undefined,
        annotationText: undefined,
        startPercentile: 0,
        endPercentile: 0.125,
        tooltip: "12% of trials finished by 2 Jan 2020",
      },
      {
        date: new Date("2020-01-04T00:00:00.000Z"),
        count: 2,
        annotation: undefined,
        annotationText: undefined,
        startPercentile: 0.125,
        endPercentile: 0.375,
        tooltip: "37% of trials finished by 4 Jan 2020",
      },
      {
        date: new Date("2020-01-06T00:00:00.000Z"),
        count: 3,
        annotation: "50th",
        annotationText: "2020-01-06T00:00:00.000Z",
        startPercentile: 0.375,
        endPercentile: 0.75,
        tooltip: "75% of trials finished by 6 Jan 2020",
      },
      {
        date: new Date("2020-01-10T00:00:00.000Z"),
        count: 1,
        annotation: "85th",
        annotationText: "2020-01-10T00:00:00.000Z",
        startPercentile: 0.75,
        endPercentile: 0.875,
        tooltip: "87% of trials finished by 10 Jan 2020",
      },
      {
        date: new Date("2020-01-11T00:00:00.000Z"),
        count: 1,
        annotation: "95th",
        annotationText: "2020-01-11T00:00:00.000Z",
        startPercentile: 0.875,
        endPercentile: 1,
        tooltip: "100% of trials finished by 11 Jan 2020",
      },
    ]);
  });
});
