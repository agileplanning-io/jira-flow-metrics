export enum StatusCategory {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
}

export enum HierarchyLevel {
  Story = "Story",
  Epic = "Epic",
}

export type Status = {
  jiraId: string;
  name: string;
  category: StatusCategory;
};

export type Field = {
  jiraId: string;
  name?: string;
};

export type TransitionStatus = {
  name: string;
  category: StatusCategory;
};

export type Transition = {
  date: Date;
  until: Date;
  fromStatus: TransitionStatus;
  toStatus: TransitionStatus;
  timeInStatus: number;
};

export enum ParentMetricsReason {
  /**
   * Epic policy is EpicStatus, so we don't compute metrics from stories (but none are excluded for this reason).
   */
  StatusPolicy = "StatusPolicy",

  /**
   * Epic policy is Derived, and we exclude To Do stories if the epic is completed.
   */
  ExcludedToDo = "ExcludedToDo",

  /**
   * Epic policy is Derived, and the story failed to match the policy filter.
   */
  ExcludedPolicyFilter = "ExcludedPolicyFilter",

  /**
   * Epic policy is Derived, and the story matched the policy filter.
   */
  MatchesPolicyFilter = "MatchesPolicyFilter",
}

export type IssueFlowMetrics = {
  started?: Date;
  completed?: Date;
  cycleTime?: number;
  age?: number;
  parent?: {
    includedInMetrics: boolean;
    reason: ParentMetricsReason;
  };
};

export type StartedFlowMetrics = IssueFlowMetrics & {
  started: Date;
  age: number;
};

export type CompletedFlowMetrics = IssueFlowMetrics & {
  completed: Date;
  cycleTime: number;
};

export type Issue = {
  key: string;
  externalUrl: string;
  hierarchyLevel: HierarchyLevel;
  parentKey?: string;
  parent?: Issue;
  summary: string;
  issueType?: string;
  assignee?: string;
  status: string;
  statusCategory: StatusCategory;
  resolution?: string;
  labels: string[];
  components: string[];
  created: Date;
  transitions: Transition[];
  metrics: IssueFlowMetrics;
};

export type StartedIssue = Issue & {
  metrics: StartedFlowMetrics;
};

export type CompletedIssue = Issue & {
  metrics: CompletedFlowMetrics;
};

export const isStarted = (issue: Issue): issue is StartedIssue =>
  issue.metrics.started !== undefined;

export const isCompleted = (issue: Issue): issue is CompletedIssue =>
  issue.metrics.completed !== undefined;
