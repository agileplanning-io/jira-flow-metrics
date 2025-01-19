import {
  FieldDetails,
  PageFilterDetails,
  PageProject,
  SearchResults,
  StatusDetails,
} from "jira.js/out/version3/models";

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
  getFields(): Promise<FieldDetails[]>;
  getStatuses(): Promise<StatusDetails[]>;
  searchIssues(params: SearchIssuesParams): Promise<SearchResults>;
  findProjects(params: FindPageParams): Promise<PageProject>;
  findFilters(params: FindPageParams): Promise<PageFilterDetails>;
}
