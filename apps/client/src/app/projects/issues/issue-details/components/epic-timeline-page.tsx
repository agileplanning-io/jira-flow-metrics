import { EpicTimeline } from "@agileplanning-io/flow-charts";
import { Issue } from "@agileplanning-io/flow-metrics";
import { IssuesTable } from "@app/components/issues-table";
import { IssueDetailsDrawer } from "@app/projects/reports/components/issue-details-drawer";
import { FC, useMemo, useState } from "react";

export type EpicTimelinePageProps = {
  epic: Issue;
  issues: Issue[];
};

export const EpicTimelinePage: FC<EpicTimelinePageProps> = ({
  epic,
  issues,
}: EpicTimelinePageProps) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const defaultExcludedIssues = useMemo(() => {
    return issues
      .filter(
        (issue) =>
          !issue.metrics.parent?.includedInMetrics ||
          !issue.transitions.some((t) => t.toStatus.category === "In Progress"),
      )
      .map((issue) => issue.key);
  }, [issues]);

  const filteredIssues = useMemo(
    () => issues.filter((issue) => !excludedIssues.includes(issue.key)),
    [issues, excludedIssues],
  );

  return (
    <>
      <EpicTimeline
        issues={filteredIssues}
        epic={epic}
        setSelectedIssue={setSelectedIssue}
      />
      <IssuesTable
        issues={issues}
        defaultSortField="started"
        onExcludedIssuesChanged={setExcludedIssues}
        defaultExcludedIssueKeys={defaultExcludedIssues}
      />
      <IssueDetailsDrawer
        selectedIssues={selectedIssue ? [selectedIssue] : []}
        onClose={() => setSelectedIssue(null)}
        open={selectedIssue !== null}
      />
    </>
  );
};
