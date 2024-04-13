import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  CycleTimePolicy,
  HierarchyLevel,
  Issue,
  IssueFlowMetrics,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { qsStringify } from "@agileplanning-io/flow-lib";

const issuesQueryKey = "issues";

const parseIssue = (issue: Issue): Issue => {
  const parent: Issue | undefined = issue.parent
    ? parseIssue(issue.parent)
    : undefined;
  const metrics: IssueFlowMetrics = {
    ...issue.metrics,
    started: parseDate(issue.metrics.started),
    completed: parseDate(issue.metrics.completed),
  };
  return {
    ...issue,
    metrics,
    created: parseDate(issue.created)!,
    transitions: issue.transitions
      ? issue.transitions.map((transition) => ({
          ...transition,
          date: new Date(transition.date),
          until: new Date(transition.until),
        }))
      : [],
    parent,
  };
};

const getIssues = async (
  projectId: string | undefined,
  policy?: CycleTimePolicy,
): Promise<Issue[]> => {
  if (!policy) return Promise.resolve([]);
  const policyQuery = qsStringify({ policy });

  const url = `/projects/${projectId}/issues?${policyQuery}`;

  const response = await axios.get(url);
  return response.data.map(parseIssue);
};

const parseDate = (date: string | Date | undefined): Date | undefined => {
  return date ? new Date(date) : undefined;
};

export const useIssues = (
  projectId: string | undefined,
  policy?: CycleTimePolicy,
) => {
  return useQuery({
    queryKey: [issuesQueryKey, projectId, JSON.stringify(policy)],
    queryFn: () => getIssues(projectId, policy),
    enabled: projectId !== undefined && policy !== undefined,
  });
};

export type WorkflowStage = {
  name: string;
  selectByDefault: boolean;
  statuses: TransitionStatus[];
};

export type ProjectWorkflows = {
  [HierarchyLevel.Story]: WorkflowStage[];
  [HierarchyLevel.Epic]: WorkflowStage[];
};

const getProjectWorkflows = async (
  projectId?: string,
): Promise<ProjectWorkflows> => {
  const response = await axios.get(`/projects/${projectId}/workflows`);
  return response.data;
};

export const useProjectWorkflows = (projectId?: string) => {
  return useQuery({
    queryKey: [issuesQueryKey, projectId],
    queryFn: () => getProjectWorkflows(projectId),
    enabled: projectId !== undefined,
  });
};
