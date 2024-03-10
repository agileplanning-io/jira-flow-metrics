import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  HierarchyLevel,
  Issue,
  IssueFlowMetrics,
  LabelFilterType,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";

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
  includeWaitTime: boolean,
  statuses?: string[],
  labels?: string[],
  labelFilterType?: LabelFilterType,
  components?: string[],
): Promise<Issue[]> => {
  let url = `/projects/${projectId}/issues?includeWaitTime=${includeWaitTime}`;
  if (statuses) {
    url += `&statuses=${statuses.join()}`;
  }
  if (labels && labels.length > 0) {
    url += `&labels=${labels.join()}`;
  }
  if (labelFilterType) {
    url += `&labelFilterType=${labelFilterType}`;
  }
  if (components && components.length > 0) {
    url += `&components=${components.join()}`;
  }
  const response = await axios.get(url);
  return response.data.map(parseIssue);
};

const parseDate = (date: string | Date | undefined): Date | undefined => {
  return date ? new Date(date) : undefined;
};

export const useIssues = (
  projectId: string | undefined,
  includeWaitTime: boolean,
  statuses?: string[],
  labels?: string[],
  labelFilterType?: LabelFilterType,
  components?: string[],
) => {
  return useQuery({
    queryKey: [
      issuesQueryKey,
      projectId,
      includeWaitTime,
      statuses,
      labels,
      labelFilterType,
      components,
    ],
    queryFn: () =>
      getIssues(
        projectId,
        includeWaitTime,
        statuses,
        labels,
        labelFilterType,
        components,
      ),
    enabled: projectId !== undefined && includeWaitTime !== undefined,
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
