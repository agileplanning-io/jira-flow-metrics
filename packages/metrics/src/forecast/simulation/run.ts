import { times } from "remeda";
import { RandomGenerator, selectValue } from "./select";
import { categorizeWeekday } from "@agileplanning-io/flow-lib";

export type InputMeasurements = {
  cycleTimes: number[];
  throughputs: { [dayCategory: string]: number[] };
};

type RunOnceParams = {
  issueCount: number;
  measurements: InputMeasurements;
  startWeekday: number;
  excludeLeadTimes: boolean;
  generator: RandomGenerator;
};

export function runOnce({
  issueCount,
  measurements,
  startWeekday,
  excludeLeadTimes,
  generator,
}: RunOnceParams): number {
  let time = excludeLeadTimes
    ? 0
    : selectValue(measurements.cycleTimes, generator);
  let weekday = Math.floor(time + startWeekday);
  while (weekday > 7) {
    weekday -= 7;
  }
  while (issueCount > 0) {
    const category = categorizeWeekday(weekday);
    const throughput = selectValue(
      measurements.throughputs[category],
      generator,
    );
    issueCount -= throughput;
    time += 1;
    weekday += 1;
    while (weekday > 7) {
      weekday -= 7;
    }
  }
  return time;
}

export function getLongTailCutoff(rowCount: number): number {
  if (rowCount < 50) {
    return 0;
  }
  if (rowCount < 100) {
    return 0.01;
  }
  if (rowCount < 200) {
    return 0.02;
  }
  return 0.025;
}

export type RunParams = RunOnceParams & {
  runCount: number;
};

export function run({ runCount, ...params }: RunParams): number[] {
  const results = times(runCount, () => runOnce(params)).sort((a, b) => a - b);
  return results;
}
