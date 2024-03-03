import { getLongTailCutoff, run } from "./simulation/run";
import { addDays, compareAsc, getISODay } from "date-fns";
import { groupBy } from "remeda";
import { formatDate } from "@agileplanning-io/flow-lib";
import { newGenerator } from "./simulation/select";
import { measure } from "./input/measurements";
import { CompletedIssue } from "../types";

export type ForecastParams = {
  selectedIssues: CompletedIssue[];
  issueCount: number;
  startDate: Date;
  excludeOutliers: boolean;
  excludeLeadTimes: boolean;
  includeLongTail: boolean;
  seed: number;
};

export const forecast = ({
  selectedIssues,
  issueCount,
  startDate,
  excludeOutliers,
  excludeLeadTimes,
  includeLongTail,
  seed,
}: ForecastParams) => {
  const measurements = measure(selectedIssues, excludeOutliers);
  const runs = run({
    issueCount,
    measurements,
    runCount: 10000,
    startWeekday: getISODay(startDate),
    excludeLeadTimes,
    generator: newGenerator(seed),
  });
  const results = summarize(runs, startDate, includeLongTail);
  return results;
};

export type SummaryRow = {
  date: Date;
  count: number;
  annotation?: string;
  annotationText?: string;
  startPercentile: number;
  endPercentile: number;
  tooltip: string;
};

export function summarize(
  runs: number[],
  startDate: Date,
  includeLongTail: boolean,
): SummaryRow[] {
  const timeByDays = groupBy(runs, (run) => Math.ceil(run).toString());
  const rowCount = Object.keys(timeByDays).length;
  const longtail = getLongTailCutoff(rowCount);
  const minPercentile = longtail;
  const maxPercentile = 1 - longtail;
  const percentiles = {
    "50": 0.5,
    "70": 0.7,
    "85": 0.85,
    "95": 0.95,
  };
  let index = 0;
  return Object.entries(timeByDays)
    .map(([duration, runsWithDuration]) => {
      const count = runsWithDuration.length;
      const date = addDays(startDate, parseInt(duration));
      const startPercentile = index / runs.length;
      const endPercentile = (index + count) / runs.length;

      const percentile = Object.entries(percentiles).find(([, percentile]) => {
        return startPercentile <= percentile && percentile < endPercentile;
      });
      const annotation = percentile ? `${percentile[0]}th` : undefined;
      const annotationText = percentile ? date.toISOString() : undefined;

      index += count;

      const percentComplete = Math.floor((index / runs.length) * 100);
      const tooltip = `${percentComplete}% of trials finished by ${formatDate(
        date,
      )}`;

      return {
        date,
        count,
        annotation,
        annotationText,
        startPercentile,
        endPercentile,
        tooltip,
      };
    })
    .filter((row) => {
      if (includeLongTail) {
        return true;
      }
      return (
        row.endPercentile >= minPercentile &&
        row.startPercentile <= maxPercentile
      );
    })
    .sort((row1, row2) => compareAsc(row1.date, row2.date));
}
