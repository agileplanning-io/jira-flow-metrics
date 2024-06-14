import {
  CompletedIssue,
  HierarchyLevel,
  Issue,
  StatusCategory,
} from "../issues";
import { TransitionContext, buildTransitions } from "../parse/issue_builder";

let issueCount = 100;

type IssueParams = Partial<Omit<Issue, "transitions" | "fields">> & {
  transitions?: TransitionContext[];
};

export const buildIssue = (params: IssueParams): Issue => {
  ++issueCount;
  const key = `TEST-${issueCount}`;
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
    created: new Date(),
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
  );

  return {
    ...result,
    transitions,
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
