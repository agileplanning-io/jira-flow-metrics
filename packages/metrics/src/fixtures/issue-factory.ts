import {
  Issue,
  HierarchyLevel,
  StatusCategory,
  CompletedIssue,
  TransitionContext,
  buildTransitions,
} from "../issues";

let issueCount = 100;

type IssueParams = Partial<Omit<Issue, "transitions" | "fields">> & {
  transitions?: TransitionContext[];
};

export const buildIssue = (
  params: IssueParams,
  now: Date = new Date(),
): Issue => {
  ++issueCount;
  const key = `TEST-${issueCount}`;
  const created = params.transitions?.[0]?.date ?? now;
  const defaults: Issue = {
    key,
    externalUrl: `https://jira.example.com/browse/${key}`,
    hierarchyLevel: HierarchyLevel.Story,
    summary: `Some issue ${issueCount}`,
    status: "Backlog",
    statusCategory: StatusCategory.ToDo,
    issueType: params.hierarchyLevel === HierarchyLevel.Epic ? "Epic" : "Story",
    labels: [],
    components: [],
    assignee: "Test User",
    created,
    transitions: [],
    metrics: {},
  };

  const result = {
    ...defaults,
    ...params,
  };

  const transitions = buildTransitions(
    result.transitions,
    result.created,
    result.status,
    result.statusCategory,
    now,
  );

  return {
    ...result,
    transitions,
  };
};

type BuildCompletedIssueParams = Partial<Omit<CompletedIssue, "metrics">> & {
  metrics: {
    started?: Date;
    completed: Date;
    cycleTime: number;
  };
};

export const buildCompletedIssue = (
  params: BuildCompletedIssueParams,
): CompletedIssue => {
  return buildIssue(params) as CompletedIssue;
};
