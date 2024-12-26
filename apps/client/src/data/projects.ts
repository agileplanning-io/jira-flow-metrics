import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "./client";
import {
  CycleTimePolicy,
  DraftPolicy,
  IssueFilter,
  savedPolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { WorkflowStage } from "./issues";
import { z } from "zod";

export type DataSource = {
  name: string;
  jql: string;
  type: "project" | "filter";
};

export type Workflow = {
  stages: WorkflowStage[];
  statuses: TransitionStatus[];
};

export type WorkflowScheme = {
  stories: Workflow;
  epics: Workflow;
};

export type Project = {
  id: string;
  name: string;
  jql: string;
  domainId: string;
  workflowScheme: WorkflowScheme;
  defaultCycleTimePolicy: CycleTimePolicy;
  defaultCompletedFilter: IssueFilter;
  issueTypes: string[];
  labels: string[];
  components: string[];
  resolutions: string[];
  lastSync?: {
    date: Date;
    issueCount: number;
  };
};

const projectsQueryKey = (domainId?: string) => [
  "domains",
  domainId,
  "projects",
];

const projectQueryKey = (projectId?: string) => ["projects", projectId];

const dataSourcesQueryKey = (domainId: string | undefined, query: string) => [
  "domains",
  domainId,
  "datasources",
  query,
];

const getDataSources = async (
  domainId: string | undefined,
  query: string,
): Promise<DataSource[]> => {
  if (query.trim().length === 0) {
    return [];
  }

  const response = await axios.get(
    `/domains/${domainId}/sources?query=${encodeURI(query)}`,
  );
  return response.data;
};

export const useDataSources = (domainId: string | undefined, query: string) => {
  return useQuery({
    queryKey: dataSourcesQueryKey(domainId, query),
    queryFn: () => getDataSources(domainId, query),
    enabled: domainId !== undefined,
  });
};

const getProject = async (projectId?: string): Promise<Project> => {
  const response = await axios.get(`/projects/${projectId}`);
  const project = response.data;
  const lastSync = project.lastSync;
  return {
    ...project,
    lastSync: lastSync
      ? {
          ...lastSync,
          date: new Date(lastSync.date),
        }
      : undefined,
  };
};

export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: projectQueryKey(projectId),
    queryFn: () => getProject(projectId),
    enabled: projectId !== undefined,
  });
};

const parseProject = (project: Project) => {
  const lastSync = project.lastSync;
  return {
    ...project,
    lastSync: lastSync
      ? {
          ...lastSync,
          date: new Date(lastSync.date),
        }
      : undefined,
  };
};

const getProjects = async (domainId?: string): Promise<Project[]> => {
  const response = await axios.get(`/domains/${domainId}/projects`);
  return response.data.map(parseProject);
};

export const useProjects = (domainId?: string) => {
  return useQuery({
    queryKey: projectsQueryKey(domainId),
    queryFn: () => getProjects(domainId),
    enabled: domainId !== undefined,
  });
};

const syncProject = async (projectId: string): Promise<void> => {
  await axios.put(`/projects/${projectId}/sync`);
};

export const useSyncProject = () => {
  return useMutation({
    mutationFn: syncProject,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

const removeProject = async (projectId?: string): Promise<void> => {
  await axios.delete(`/projects/${projectId}`);
};

export const useRemoveProject = (projectId?: string) => {
  return useMutation({
    mutationFn: () => removeProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export type CreateProjectParams = {
  domainId: string | undefined;
  project: Omit<Project, "id">;
};

const createProject = async (params: CreateProjectParams): Promise<Project> => {
  const response = await axios.post(
    `/domains/${params.domainId}/projects`,
    params.project,
  );
  return response.data;
};

export const useCreateProject = () => {
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export type UpdateProjectParams = {
  id: string;
  name: string;
  storyWorkflowStages: { name: string; statuses: string[] }[];
  epicWorkflowStages: { name: string; statuses: string[] }[];
  defaultCycleTimePolicy: CycleTimePolicy;
  defaultCompletedFilter: IssueFilter;
};

const updateProject = async ({
  id,
  ...params
}: UpdateProjectParams): Promise<Project> => {
  const response = await axios.put(`/projects/${id}`, params);
  return response.data;
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (response) => {
      const project = parseProject(response);
      queryClient.setQueryData(projectQueryKey(project.id), project);

      const projects = queryClient.getQueryData<Project[]>(
        projectsQueryKey(project.domainId),
      );
      if (!projects) {
        return;
      }

      const projectIndex = projects?.findIndex(
        (cached) => cached.id === project.id,
      );
      if (projectIndex !== undefined && projectIndex >= 0) {
        projects[projectIndex] = project;
      }
    },
  });
};

const policiesResponse = z.array(savedPolicy);

const policiesUrl = (projectId: string) => `/projects/${projectId}/policies`;

const getPolicies = async (projectId?: string) => {
  if (projectId === undefined) {
    return [];
  }

  const response = await axios.get(policiesUrl(projectId));
  return policiesResponse.parse(response.data);
};

export const useGetPolicies = (projectId?: string) => {
  return useQuery({
    queryKey: [policiesUrl(projectId ?? "undefined")],
    queryFn: () => getPolicies(projectId),
  });
};

const createPolicy = async (projectId: string, policy: DraftPolicy) => {
  const response = await axios.post(policiesUrl(projectId), policy);
  return savedPolicy.parse(response.data);
};

export const useCreatePolicy = (projectId: string) => {
  return useMutation({
    mutationFn: (policy: DraftPolicy) => createPolicy(projectId, policy),
  });
};

const policyUrl = (projectId: string, policyId: string) =>
  `/projects/${projectId}/policies/${policyId}`;

const setDefaultPolicyUrl = (projectId: string, policyId: string) =>
  `${policyUrl(projectId, policyId)}/default`;

const setDefaultPolicy = async (projectId: string, policyId: string) => {
  await axios.put(setDefaultPolicyUrl(projectId, policyId));
};

export const useSetDefaultPolicy = (projectId: string) => {
  return useMutation({
    mutationFn: (policyId: string) => setDefaultPolicy(projectId, policyId),
  });
};

const deletePolicy = async (projectId: string, policyId: string) => {
  await axios.delete(policyUrl(projectId, policyId));
};

export const useDeletePolicy = (projectId: string) => {
  return useMutation({
    mutationFn: (policyId: string) => deletePolicy(projectId, policyId),
  });
};
