import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  HierarchyLevel,
  Issue,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";

const issuesQueryKey = "issues";

const parseIssue = (issue: Issue): Issue => {
  const parent: Issue | undefined = issue.parent
    ? parseIssue(issue.parent)
    : undefined;
  return {
    ...issue,
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

const getIssues = async (projectId: string | undefined): Promise<Issue[]> => {
  const url = `/projects/${projectId}/issues`;

  const response = await axios.get(url);
  return response.data.map(parseIssue);
};

const parseDate = (date: string | Date | undefined): Date | undefined => {
  return date ? new Date(date) : undefined;
};

export const useIssues = (projectId: string | undefined) => {
  return useQuery({
    queryKey: [issuesQueryKey, projectId],
    queryFn: () => getIssues(projectId),
    enabled: projectId !== undefined,
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
