import { Version3Models } from "jira.js";

export type SearchIssuesParams = {
  jql: string;
  fields: string[];
  startAt?: number;
};

export type FindPageParams = {
  query: string;
  startAt?: number;
};

export interface JiraClient {
  getFields(): Promise<Version3Models.FieldDetails[]>;
  getStatuses(): Promise<Version3Models.StatusDetails[]>;
  searchIssues(
    params: SearchIssuesParams,
  ): Promise<Version3Models.SearchResults>;
  searchIssuesNew(
    params: SearchIssuesParams,
  ): Promise<Version3Models.SearchAndReconcileResults>;
  findProjects(params: FindPageParams): Promise<Version3Models.PageProject>;
  findFilters(
    params: FindPageParams,
  ): Promise<Version3Models.PageFilterDetails>;
}
