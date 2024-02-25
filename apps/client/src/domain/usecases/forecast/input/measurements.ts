import { CompletedIssue } from "@agileplanning-io/flow-metrics";
import { eachDayOfInterval, endOfDay, getISODay, startOfDay } from "date-fns";
import { InputMeasurements } from "../simulation/run";
import { excludeOutliersFromSeq } from "@agileplanning-io/flow-lib";
import { categorizeWeekday } from "@agileplanning-io/flow-lib";

export const computeThroughput = (
  issues: CompletedIssue[],
): { date: Date; count: number }[] => {
  const interval = {
    start: startOfDay(issues[0].metrics.completed),
    end: endOfDay(issues[issues.length - 1].metrics.completed),
  };
  const dates = eachDayOfInterval(interval);
  const results: Record<string, number> = {};
  for (const issue of issues) {
    const key = startOfDay(issue.metrics.completed).toISOString();
    results[key] = (results[key] || 0) + 1;
  }
  for (const date of dates) {
    const key = startOfDay(date).toISOString();
    if (!results[key]) {
      results[key] = 0;
    }
  }
  return dates.map((date) => {
    const key = startOfDay(date).toISOString();
    return { date, count: results[key] };
  });
};

export const measure = (
  issues: CompletedIssue[],
  excludeCycleTimeOutliers: boolean,
): InputMeasurements => {
  const throughputs: Record<string, number[]> = {};
  for (const { date, count } of computeThroughput(issues)) {
    const category = categorizeWeekday(getISODay(date));
    if (!throughputs[category]) {
      throughputs[category] = [];
    }
    throughputs[category].push(count);
  }
  let cycleTimes = issues.map((issue) => issue.metrics.cycleTime);
  if (excludeCycleTimeOutliers) {
    cycleTimes = excludeOutliersFromSeq(cycleTimes, (x: number) => x);
  }
  return {
    cycleTimes,
    throughputs,
  };
};
