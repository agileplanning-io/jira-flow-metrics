import { subDays } from "date-fns";
import { buildCompletedIssue } from "../fixtures";
import { forecast } from "./forecast";

describe("forecast", () => {
  it("returns a forecast", () => {
    const now = new Date(Date.parse("2024-01-01T10:30:00.000Z"));
    const issues = [
      buildCompletedIssue({
        metrics: { completed: subDays(now, 5), cycleTime: 2 },
      }),
      buildCompletedIssue({
        metrics: { completed: subDays(now, 3), cycleTime: 2.5 },
      }),
      buildCompletedIssue({
        metrics: { completed: now, cycleTime: 1 },
      }),
    ];

    const result = forecast({
      interval: { start: subDays(now, 5), end: now },
      selectedIssues: issues,
      issueCount: 3,
      startDate: now,
      excludeOutliers: false,
      includeLeadTimes: true,
      includeLongTail: false,
      seed: 123,
    });

    expect(result).toEqual({
      startDate: now,
      percentiles: [
        {
          percentile: 30,
          value: 4,
        },
        {
          percentile: 50,
          value: 4.5,
        },
        {
          percentile: 70,
          value: 5,
        },
        {
          percentile: 85,
          value: 5.5,
        },
        {
          percentile: 95,
          value: 8.5,
        },
      ],
      rows: [
        {
          count: 1911,
          cumulativeCount: 1911,
          time: new Date(Date.parse("2024-01-04T10:30:00.000Z")),
          endQuantile: 0.1911,
          startQuantile: 0,
        },
        {
          count: 2845,
          cumulativeCount: 4756,
          time: new Date(Date.parse("2024-01-05T10:30:00.000Z")),
          endQuantile: 0.4756,
          startQuantile: 0.1911,
        },
        {
          count: 3128,
          cumulativeCount: 7884,
          time: new Date(Date.parse("2024-01-06T10:30:00.000Z")),
          endQuantile: 0.7884,
          startQuantile: 0.4756,
        },
        {
          count: 837,
          cumulativeCount: 8721,
          time: new Date(Date.parse("2024-01-07T10:30:00.000Z")),
          endQuantile: 0.8721,
          startQuantile: 0.7884,
        },
        {
          count: 509,
          cumulativeCount: 9230,
          time: new Date(Date.parse("2024-01-09T10:30:00.000Z")),
          endQuantile: 0.923,
          startQuantile: 0.8721,
        },
        {
          count: 530,
          cumulativeCount: 9760,
          time: new Date(Date.parse("2024-01-10T10:30:00.000Z")),
          endQuantile: 0.976,
          startQuantile: 0.923,
        },
        {
          count: 163,
          cumulativeCount: 9923,
          time: new Date(Date.parse("2024-01-11T10:30:00.000Z")),
          endQuantile: 0.9923,
          startQuantile: 0.976,
        },
        {
          count: 50,
          cumulativeCount: 9973,
          time: new Date(Date.parse("2024-01-12T10:30:00.000Z")),
          endQuantile: 0.9973,
          startQuantile: 0.9923,
        },
        {
          count: 20,
          cumulativeCount: 9993,
          time: new Date(Date.parse("2024-01-13T10:30:00.000Z")),
          endQuantile: 0.9993,
          startQuantile: 0.9973,
        },
        {
          count: 3,
          cumulativeCount: 9996,
          time: new Date(Date.parse("2024-01-14T10:30:00.000Z")),
          endQuantile: 0.9996,
          startQuantile: 0.9993,
        },
        {
          count: 2,
          cumulativeCount: 9998,
          time: new Date(Date.parse("2024-01-16T10:30:00.000Z")),
          endQuantile: 0.9998,
          startQuantile: 0.9996,
        },
        {
          count: 2,
          cumulativeCount: 10000,
          time: new Date(Date.parse("2024-01-17T10:30:00.000Z")),
          endQuantile: 1,
          startQuantile: 0.9998,
        },
      ],
    });
  });
});
