import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { client } from "./client";
import { CycleTimePolicy, TransitionStatus } from "@jbrunton/flow-metrics";
import { WorkflowStage } from "./issues";

export type DataSource = {
  name: string;
  jql: string;
  type: "project" | "filter";
};

export type Dataset = {
  id: string;
  name: string;
  jql: string;
  domainId: string;
  statuses: TransitionStatus[];
  workflow: WorkflowStage[];
  defaultCycleTimePolicy: CycleTimePolicy;
  labels: string[];
  components: string[];
  lastSync?: {
    date: Date;
    issueCount: number;
  };
};

const datasetsQueryKey = (domainId?: string) => [
  "domains",
  domainId,
  "datasets",
];

export const invalidateDataSourceQueries = () =>
  client.invalidateQueries([datasetsQueryKey]);

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
    queryKey: [...datasetsQueryKey(domainId), query],
    queryFn: () => getDataSources(domainId, query),
    enabled: domainId !== undefined,
  });
};

const getDataset = async (datasetId?: string): Promise<Dataset> => {
  const response = await axios.get(`/datasets/${datasetId}`);
  const dataset = response.data;
  const lastSync = dataset.lastSync;
  return {
    ...dataset,
    lastSync: lastSync
      ? {
          ...lastSync,
          date: new Date(lastSync.date),
        }
      : undefined,
  };
};

export const useDataset = (datasetId?: string) => {
  return useQuery({
    queryKey: ["datasets", datasetId],
    queryFn: () => getDataset(datasetId),
    enabled: datasetId !== undefined,
  });
};

const getDatasets = async (domainId?: string): Promise<Dataset[]> => {
  const response = await axios.get(`/domains/${domainId}/datasets`);
  return response.data.map((dataset: Dataset) => {
    const lastSync = dataset.lastSync;
    return {
      ...dataset,
      lastSync: lastSync
        ? {
            ...lastSync,
            date: new Date(lastSync.date),
          }
        : undefined,
    };
  });
};

export const useDatasets = (domainId?: string) => {
  return useQuery({
    queryKey: datasetsQueryKey(domainId),
    queryFn: () => getDatasets(domainId),
    enabled: domainId !== undefined,
  });
};

const syncDataset = async (datasetId: string): Promise<void> => {
  await axios.put(`/datasets/${datasetId}/sync`);
};

export const useSyncDataset = () => {
  return useMutation({
    mutationFn: syncDataset,
    onSuccess: () => {
      client.invalidateQueries();
    },
  });
};

const removeDataset = async (datasetId: string): Promise<void> => {
  await axios.delete(`/datasets/${datasetId}`);
};

export const useRemoveDataset = (datasetId?: string) => {
  return useMutation({
    mutationFn: () => removeDataset(datasetId ?? ""),
    onSuccess: () => {
      client.invalidateQueries();
    },
  });
};

export type CreateDatasetParams = {
  domainId: string | undefined;
  dataset: Omit<Dataset, "id">;
};

const createDataset = async (params: CreateDatasetParams): Promise<Dataset> => {
  const response = await axios.post(
    `/domains/${params.domainId}/datasets`,
    params.dataset,
  );
  return response.data;
};

export const useCreateDataset = () => {
  return useMutation({
    mutationFn: createDataset,
    onSuccess: () => client.invalidateQueries(),
  });
};

export type UpdateDatasetParams = {
  id: string;
  name: string;
  workflow: { name: string; statuses: string[] }[];
  defaultCycleTimePolicy: CycleTimePolicy;
};

const updateDataset = async ({
  id,
  ...params
}: UpdateDatasetParams): Promise<Dataset> => {
  const response = await axios.put(`/datasets/${id}`, params);
  return response.data;
};

export const useUpdateDataset = () => {
  return useMutation({
    mutationFn: updateDataset,
    onSuccess: () => client.invalidateQueries(),
  });
};
