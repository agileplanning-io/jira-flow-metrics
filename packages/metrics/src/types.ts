import { IssueFilter } from "./util";

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

export type IssueFlowMetrics = {
  started?: Date;
  completed?: Date;
  cycleTime?: number;
  includedInEpic?: boolean;
};

export type StartedFlowMetrics = IssueFlowMetrics & {
  started: Date;
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
  issue.metrics.completed !== undefined &&
  issue.metrics.cycleTime !== undefined;

export type CycleTimePolicy = {
  includeWaitTime: boolean;
  statuses?: string[];
  labels?: IssueFilter["labels"];
  labelFilterType?: IssueFilter["labelFilterType"];
  components?: IssueFilter["components"];
};
