import {
  CycleTimePolicy,
  DraftPolicy,
  IssueFilter,
  SavedPolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { Domain } from "./domains";
import { flatten } from "remeda";
import { AgileModels } from "jira.js";

export type WorkflowStage = {
  name: string;
  selectByDefault: boolean;
  statuses: TransitionStatus[];
};

export type Workflow = {
  stages: WorkflowStage[];
  statuses: TransitionStatus[];
};

export type WorkflowScheme = {
  stories: Workflow;
  epics: Workflow;
};

export const statusesInWorkflowStages = (stages: WorkflowStage[]): string[] =>
  flatten(stages.map((stage) => stage.statuses.map((status) => status.name)));

export type Project = {
  id: string;
  domainId: string;
  name: string;
  jql: string;
  lastSync?: {
    date: Date;
    issueCount: number;
  };
  labels: string[];
  components: string[];
  resolutions: string[];
  issueTypes: string[];
  workflowScheme?: WorkflowScheme;
  defaultCycleTimePolicy?: CycleTimePolicy;
  defaultCompletedFilter?: IssueFilter;
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

export abstract class PoliciesRepository {
  abstract getPolicies(projectId: string): Promise<SavedPolicy[]>;
  abstract createPolicy(
    projectId: string,
    policy: DraftPolicy,
  ): Promise<SavedPolicy>;
  abstract updatePolicy(
    projectId: string,
    policyId: string,
    policy: SavedPolicy,
  ): Promise<void>;
  abstract setDefaultPolicy(projectId: string, policyId: string): Promise<void>;
  abstract deletePolicy(projectId: string, policyId: string): Promise<void>;
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

export type BoardSource = {
  id: number;
  name?: string;
  type?: string;
  location?: string;
};

// type BoardColumn = {
//   name?: string;
//   statuses?:
// }

// export type BoardConfig = {
//   columns: { name?: string; }
// }

export abstract class BoardsRepository {
  abstract getBoards(domain: Domain, name: string): Promise<BoardSource[]>;
  abstract getBoardConfig(
    domain: Domain,
    boardId: number,
  ): Promise<AgileModels.BoardConfig>;
}
