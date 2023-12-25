import { HierarchyLevel, Issue, StatusCategory } from "../types";
import { TransitionContext, buildTransitions } from "../parse/issue_builder";

let issueCount = 100;

type IssueParams = Partial<Omit<Issue, "transitions" | "fields">> & {
  transitions: TransitionContext[];
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
