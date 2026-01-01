import { Version3Models } from "jira.js";

type SearchAndReconcileResults = Version3Models.SearchAndReconcileResults;
type BulkIssue = Version3Models.BulkIssue;
type PageProject = Version3Models.PageProject;
type FieldDetails = Version3Models.FieldDetails;
type StatusDetails = Version3Models.StatusDetails;
type PageFilterDetails = Version3Models.PageFilterDetails;

export type {
  BulkIssue,
  PageProject,
  SearchAndReconcileResults,
  FieldDetails,
  StatusDetails,
  PageFilterDetails,
};

export type FindPageParams = {
  query: string;
  startAt?: number;
};

export type EnhancedSearchParams = {
  jql: string;
  nextPageToken?: string;
};

export type BulkFetchParams = {
  fields: string[];
  keys: string[];
};

export interface JiraClient {
  readonly host: string;
  getFields(): Promise<FieldDetails[]>;
  getStatuses(): Promise<StatusDetails[]>;
  enhancedSearch(
    params: EnhancedSearchParams,
  ): Promise<SearchAndReconcileResults>;
  fetchIssues(params: BulkFetchParams): Promise<BulkIssue>;
  findProjects(params: FindPageParams): Promise<PageProject>;
  findFilters(params: FindPageParams): Promise<PageFilterDetails>;
}
