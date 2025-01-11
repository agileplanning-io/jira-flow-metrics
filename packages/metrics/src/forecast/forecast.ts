import { runSimulation } from "./simulation/run";
import { addDays, compareAsc, getISODay } from "date-fns";
import { groupBy } from "remeda";
import { SeedRandomGenerator } from "./simulation/select";
import { computeInputs } from "./inputs/inputs";
import { CompletedIssue } from "../issues";
import {
  AbsoluteInterval,
  Interval,
  Percentile,
  getPercentiles,
} from "@agileplanning-io/flow-lib";

export type ForecastParams = {
  interval: Interval;
  selectedIssues: CompletedIssue[];
  issueCount: number;
  startDate?: Date;
  exclusions?: AbsoluteInterval[];
  excludeOutliers: boolean;
  includeLeadTimes: boolean;
  includeLongTail: boolean;
  seed: number;
};

export type SummaryRow = {
  time: Date | number;
  /**
   * The count of simulations which finished on `date`.
   */
  count: number;
  /**
   * The cumulative count of simulations which finished by `date`.
   */
  cumulativeCount: number;
  /**
   * The quantile of runs completed at the start of `date`.
   */
  startQuantile: number;
  /**
   * The quantile of runs complete at the end of `date`.
   */
  endQuantile: number;
};

export type SummaryResult = {
  startDate: Date | undefined;
  rows: SummaryRow[];
  percentiles: Percentile[];
};

export const forecast = ({
  interval,
  selectedIssues,
  issueCount,
  startDate,
  exclusions,
  excludeOutliers,
  includeLeadTimes,
  includeLongTail,
  seed,
}: ForecastParams): SummaryResult => {
  const generator = new SeedRandomGenerator(seed);
  const inputs = computeInputs(
    interval,
    selectedIssues,
    excludeOutliers,
    exclusions,
  );

  if (!Object.values(inputs.throughputs).length) {
    return { startDate, rows: [], percentiles: [] };
  }

  const runs = runSimulation({
    issueCount,
    inputs,
    runCount: 10000,
    startWeekday: startDate ? getISODay(startDate) : 1,
    includeLeadTimes,
    generator,
  });

  const results = summarize(runs, startDate, includeLongTail);

  return results;
};

export function summarize(
  runs: number[],
  startDate: Date | undefined,
  includeLongTail: boolean,
): SummaryResult {
  const runsByDuration = groupBy(runs, (run) => Math.ceil(run));

  const rowCount = Object.keys(runsByDuration).length;
  const longtail = getLongTailCutoff(rowCount);
  const minQuantile = longtail;
  const maxQuantile = 1 - longtail;

  const filterLongTail = (row: SummaryRow) => {
    if (includeLongTail) {
      return true;
    }
    return row.endQuantile >= minQuantile && row.startQuantile <= maxQuantile;
  };

  const appendRow = (
    prevRows: SummaryRow[],
    duration: string,
  ): SummaryRow[] => {
    const prevTotal =
      prevRows.length > 0 ? prevRows[prevRows.length - 1].cumulativeCount : 0;
    const runsWithDuration = runsByDuration[duration];

    const count = runsWithDuration.length;
    const cumulativeCount = count + prevTotal;
    const date = startDate ? addDays(startDate, parseInt(duration)) : undefined;
    const time = date ?? parseInt(duration);
    const startQuantile = prevTotal / runs.length;
    const endQuantile = (prevTotal + count) / runs.length;

    const nextRow = {
      time,
      count,
      startQuantile,
      endQuantile,
      cumulativeCount,
    };

    return [...prevRows, nextRow];
  };

  const percentiles = getPercentiles(runs);

  const rows = Object.keys(runsByDuration)
    .reduce(appendRow, [])
    .filter(filterLongTail)
    .sort((row1, row2) => compareAsc(row1.time, row2.time));

  return {
    startDate,
    rows,
    percentiles,
  };
}

const getLongTailCutoff = (rowCount: number) => {
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
};
