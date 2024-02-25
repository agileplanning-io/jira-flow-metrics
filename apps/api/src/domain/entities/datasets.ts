import {
  CycleTimePolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { Domain } from "./domains";

export type WorkflowStage = {
  name: string;
  selectByDefault: boolean;
  statuses: TransitionStatus[];
};

export type Dataset = {
  id: string;
  domainId: string;
  name: string;
  jql: string;
  lastSync?: {
    date: Date;
    issueCount: number;
  };
  statuses: TransitionStatus[];
  labels: string[];
  components: string[];
  workflow?: WorkflowStage[];
  defaultCycleTimePolicy?: CycleTimePolicy;
};

export type DataSource = {
  name: string;
  type: "filter" | "project";
  jql: string;
};

export type CreateDatasetParams = Omit<Dataset, "id" | "lastSync">;
export type UpdateDatasetParams = Partial<CreateDatasetParams> &
  Pick<Dataset, "lastSync">;

export abstract class DatasetsRepository {
  abstract getDatasets(domainId: string): Promise<Dataset[]>;
  abstract getDataset(datasetId: string): Promise<Dataset>;
  abstract addDataset(params: CreateDatasetParams): Promise<Dataset>;
  abstract updateDataset(
    datasetId: string,
    params: UpdateDatasetParams,
  ): Promise<Dataset>;
  abstract removeDataset(datasetId: string): Promise<void>;
  abstract removeDatasets(domainId: string): Promise<void>;
}

export type SearchDataSourcesParams = {
  domain: Pick<Domain, "host" | "email" | "token">;
  query: string;
};

export abstract class DataSourcesRepository {
  abstract getDataSources(
    params: SearchDataSourcesParams,
  ): Promise<DataSource[]>;
}
