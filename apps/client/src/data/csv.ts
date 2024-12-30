import { Issue } from "@agileplanning-io/flow-metrics";
import saveAs from "file-saver";
import { unparse } from "papaparse";
import { isNullish, round } from "remeda";
import { Project } from "./projects";
import { CurrentPolicy } from "@agileplanning-io/flow-components";
import { format } from "date-fns";

const formatTimestamp = (date?: Date) =>
  date ? format(date, "yyyy-MM-dd HH:mm:ss") : undefined;

export const downloadCsv = (
  project: Project,
  policy: CurrentPolicy,
  issues: Issue[],
) => {
  const content = unparse(
    issues.map((issue) => ({
      key: issue.key,
      summary: issue.summary,
      url: issue.externalUrl,
      started: formatTimestamp(issue.metrics.started),
      completed: formatTimestamp(issue.metrics.completed),
      cycleTime: isNullish(issue.metrics.cycleTime)
        ? null
        : round(issue.metrics.cycleTime, 1),
    })),
    { header: true },
  );

  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });

  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const filename = `${project.name}-${policy.name}-issues-${timestamp}.csv`;

  saveAs(blob, filename);
};
