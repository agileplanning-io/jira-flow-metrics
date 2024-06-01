import { subDays } from "date-fns";
import { buildCompletedIssue } from "../../fixtures";
import { computeThroughput, computeInputs } from "./inputs";

describe("computeThroughput", () => {
  it("computes the throughput for a given ordered list of issues", () => {
    const issues = [
      buildCompletedIssue({
        metrics: {
          completed: new Date("2020-01-03T09:30:00.000Z"),
          cycleTime: 1,
        },
      }),
      buildCompletedIssue({
        metrics: {
          completed: new Date("2020-01-05T00:10:00.000Z"),
          cycleTime: 1,
        },
      }),
      buildCompletedIssue({
        metrics: {
          completed: new Date("2020-01-05T10:30:00.000Z"),
          cycleTime: 1,
        },
      }),
    ];

    const interval = {
      start: issues[0].metrics.completed,
      end: issues[2].metrics.completed,
    };

    expect(computeThroughput(interval, issues)).toEqual([
      { date: new Date("2020-01-03T00:00:00.000Z"), count: 1 },
      { date: new Date("2020-01-04T00:00:00.000Z"), count: 0 },
      { date: new Date("2020-01-05T00:00:00.000Z"), count: 2 },
    ]);
  });
});

describe("computeInputs", () => {
  const issues = [
    buildCompletedIssue({
      metrics: {
        cycleTime: 1,
        completed: new Date("2020-01-02T09:30:00.000Z"),
      },
    }),
    buildCompletedIssue({
      metrics: {
        cycleTime: 3,
        completed: new Date("2020-01-02T12:10:00.000Z"),
      },
    }),
    buildCompletedIssue({
      metrics: {
        cycleTime: 2,
        completed: new Date("2020-01-06T09:10:30.000Z"),
      },
    }),
    buildCompletedIssue({
      metrics: {
        cycleTime: 200,
        completed: new Date("2020-01-07T10:30:00.000Z"),
      },
    }),
  ];

  const interval = {
    start: issues[0].metrics.completed,
    end: issues[3].metrics.completed,
  };

  it("computes cycle times and throughput for the given issues", () => {
    expect(computeInputs(interval, issues, false)).toEqual({
      cycleTimes: [1, 3, 2, 200],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });

  it("computes values for the given internal", () => {
    expect(
      computeInputs(
        { start: subDays(interval.start, 2), end: interval.end },
        issues,
        false,
      ),
    ).toEqual({
      cycleTimes: [1, 3, 2, 200],
      throughputs: {
        weekend: [0, 0],
        weekday: [0, 0, 2, 0, 1, 1],
      },
    });
  });

  it("optionally excludes cycle time outliers", () => {
    expect(computeInputs(interval, issues, true)).toEqual({
      cycleTimes: [1, 3, 2],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });
});
