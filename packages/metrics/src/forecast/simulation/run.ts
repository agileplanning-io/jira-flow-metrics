import { times } from "remeda";
import { RandomGenerator, selectValue } from "./select";
import { categorizeWeekday } from "@agileplanning-io/flow-lib";

export type SimulationInputs = {
  cycleTimes: number[];
  throughputs: { [dayCategory: string]: number[] };
};

type RunOnceParams = {
  issueCount: number;
  inputs: SimulationInputs;
  startWeekday: number;
  excludeLeadTimes: boolean;
  generator: RandomGenerator;
};

export const getDayOfWeek = (
  timeInDays: number,
  startDayOfWeek: number,
): number => {
  return (Math.floor(timeInDays + startDayOfWeek - 1) % 7) + 1;
};

export function runOnce({
  issueCount,
  inputs,
  startWeekday,
  excludeLeadTimes,
  generator,
}: RunOnceParams): number {
  let durationInDays = 0;

  if (!excludeLeadTimes) {
    // In this case we're looking at a 'cold start' for work that has not yet been started, so we
    // need to factor in the initial lead time to the first item being completed.

    // If `excludeLeadTimes` is true, then we assume work is already in progress and we're just
    // forecasting 'remaining work'.
    durationInDays += selectValue(inputs.cycleTimes, generator);
    issueCount -= 1;
  }

  while (issueCount > 0) {
    const dayOfWeek = getDayOfWeek(durationInDays, startWeekday);
    const weekdayCategory = categorizeWeekday(dayOfWeek);

    const throughput = selectValue(
      inputs.throughputs[weekdayCategory] ?? [],
      generator,
    );

    issueCount -= throughput;
    durationInDays += 1;
  }

  return durationInDays;
}

export type RunParams = RunOnceParams & {
  runCount: number;
};

/**
 * Runs the simulation `runCount` number of times
 * @returns {number[]} a list of durations (in days) for each simulated run
 */
export function runSimulation({ runCount, ...params }: RunParams): number[] {
  const results = times(runCount, () => runOnce(params)).sort((a, b) => a - b);
  return results;
}
