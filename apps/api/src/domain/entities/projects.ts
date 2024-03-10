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

export type Project = {
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

export type CreateProjectParams = Omit<Project, "id" | "lastSync">;
export type UpdateProjectParams = Partial<CreateProjectParams> &
  Pick<Project, "lastSync">;

export abstract class ProjectsRepository {
  abstract getProjects(domainId: string): Promise<Project[]>;
  abstract getProject(projectId: string): Promise<Project>;
  abstract addProject(params: CreateProjectParams): Promise<Project>;
  abstract updateProject(
    projectId: string,
    params: UpdateProjectParams,
  ): Promise<Project>;
  abstract removeProject(projectId: string): Promise<void>;
  abstract removeProjects(domainId: string): Promise<void>;
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
