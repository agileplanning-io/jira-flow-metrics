import {
  CompletedIssue,
  HierarchyLevel,
  Issue,
  StatusCategory,
} from "@agileplanning-io/flow-metrics";

let issueCount = 100;

export const buildIssue = (params: Partial<Issue>): Issue => {
  ++issueCount;
  const key = `TEST-${issueCount}`;
  const defaults: Issue = {
    key,
    externalUrl: `https://jira.example.com/browse/${key}`,
    hierarchyLevel: HierarchyLevel.Story,
    summary: `Some issue ${issueCount}`,
    status: "Backlog",
    statusCategory: StatusCategory.ToDo,
    transitions: [],
    metrics: {},
    issueType: "Story",
    created: new Date(),
    labels: [],
    components: [],
  };
  return {
    ...defaults,
    ...params,
  };
};

type BuildCompletedIssueParams = Partial<Omit<CompletedIssue, "metrics">> & {
  metrics: {
    completed: Date;
    cycleTime: number;
  };
};

export const buildCompletedIssue = (
  params: BuildCompletedIssueParams,
): CompletedIssue => {
  return buildIssue(params) as CompletedIssue;
};
