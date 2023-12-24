import { buildCompletedIssue } from "test/fixtures/issue-factory";
import { describe, expect, it } from "vitest";
import { computeThroughput, measure } from "./measurements";

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
    expect(computeThroughput(issues)).toEqual([
      { date: new Date("2020-01-03T00:00:00.000Z"), count: 1 },
      { date: new Date("2020-01-04T00:00:00.000Z"), count: 0 },
      { date: new Date("2020-01-05T00:00:00.000Z"), count: 2 },
    ]);
  });
});

describe("measure", () => {
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

  it("measures cycle times and throughput for the given issues", () => {
    expect(measure(issues, false)).toEqual({
      cycleTimes: [1, 3, 2, 200],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });

  it("optionally excludes cycle time outliers", () => {
    expect(measure(issues, true)).toEqual({
      cycleTimes: [1, 3, 2],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });
});
