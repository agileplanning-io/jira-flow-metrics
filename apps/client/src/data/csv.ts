import { Issue } from "@agileplanning-io/flow-metrics";
import saveAs from "file-saver";
import { unparse } from "papaparse";
import { isNullish, round } from "remeda";

export const downloadCsv = (issues: Issue[]) => {
  const content = unparse(
    issues.map((issue) => ({
      key: issue.key,
      summary: issue.summary,
      url: issue.externalUrl,
      started: issue.metrics.started,
      completed: issue.metrics.completed,
      cycleTime: isNullish(issue.metrics.cycleTime)
        ? null
        : round(issue.metrics.cycleTime),
    })),
    { header: true },
  );
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "issues.csv");
};
