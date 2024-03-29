import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { client } from "./client";
import {
  CycleTimePolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { WorkflowStage } from "./issues";

export type DataSource = {
  name: string;
  jql: string;
  type: "project" | "filter";
};

export type Project = {
  id: string;
  name: string;
  jql: string;
  domainId: string;
  statuses: {
    stories: TransitionStatus[];
    epics: TransitionStatus[];
  };
  workflow: {
    stories: {
      stages: WorkflowStage[];
    };
    epics: {
      stages: WorkflowStage[];
    };
  };
  defaultCycleTimePolicy: CycleTimePolicy;
  labels: string[];
  components: string[];
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

export const invalidateDataSourceQueries = () =>
  client.invalidateQueries([projectsQueryKey]);

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
    queryKey: [...projectsQueryKey(domainId), query],
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
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
    enabled: projectId !== undefined,
  });
};

const getProjects = async (domainId?: string): Promise<Project[]> => {
  const response = await axios.get(`/domains/${domainId}/projects`);
  return response.data.map((project: Project) => {
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
  });
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
      client.invalidateQueries();
    },
  });
};

const removeProject = async (projectId: string): Promise<void> => {
  await axios.delete(`/projects/${projectId}`);
};

export const useRemoveProject = (projectId?: string) => {
  return useMutation({
    mutationFn: () => removeProject(projectId ?? ""),
    onSuccess: () => {
      client.invalidateQueries();
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
    onSuccess: () => client.invalidateQueries(),
  });
};

export type UpdateProjectParams = {
  id: string;
  name: string;
  storyWorkflow: { name: string; statuses: string[] }[];
  epicWorkflow: { name: string; statuses: string[] }[];
  defaultCycleTimePolicy: CycleTimePolicy;
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
    onSuccess: () => client.invalidateQueries(),
  });
};
