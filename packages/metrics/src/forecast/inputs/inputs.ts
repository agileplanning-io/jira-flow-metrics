import { eachDayOfInterval, getISODay, startOfDay } from "date-fns";
import { SimulationInputs } from "../simulation/run";
import { Interval, excludeOutliersFromSeq } from "@agileplanning-io/flow-lib";
import { categorizeWeekday } from "@agileplanning-io/flow-lib";
import { CompletedIssue } from "../../issues";

export const computeThroughput = (
  interval: Interval,
  issues: CompletedIssue[],
): { date: Date; count: number }[] => {
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

/**
 * Computes metrics (throughput and cucle times) for input to the simulation
 * @param {CompletedIssue[]} issues the completed issues from which to derive inputs
 * @param {boolean} excludeCycleTimeOutliers whether or not to include outliers in the cycle times
 * @returns a {SimulationInputs} object with cycle times and throughput
 */
export const computeInputs = (
  interval: Interval,
  issues: CompletedIssue[],
  excludeCycleTimeOutliers: boolean,
): SimulationInputs => {
  const throughputs: Record<string, number[]> = {};
  for (const { date, count } of computeThroughput(interval, issues)) {
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
