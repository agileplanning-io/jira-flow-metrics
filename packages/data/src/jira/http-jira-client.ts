import {
  FieldDetails,
  StatusDetails,
  SearchResults,
  PageProject,
  PageFilterDetails,
} from "jira.js/out/version3/models";
import { FindPageParams, JiraClient, SearchIssuesParams } from "./jira-client";
import { Version3Client } from "jira.js";

export class HttpJiraClient implements JiraClient {
  constructor(private readonly client: Version3Client) {}

  getFields(): Promise<FieldDetails[]> {
    return this.client.issueFields.getFields();
  }

  getStatuses(): Promise<StatusDetails[]> {
    return this.client.workflowStatuses.getStatuses();
  }

  searchIssues({
    jql,
    fields,
    startAt,
  }: SearchIssuesParams): Promise<SearchResults> {
    return this.client.issueSearch.searchForIssuesUsingJqlPost({
      jql,
      expand: ["changelog"],
      fields,
      startAt,
    });
  }

  findProjects({ query, startAt }: FindPageParams): Promise<PageProject> {
    return this.client.projects.searchProjects({
      query,
      startAt,
    });
  }

  findFilters({ query, startAt }: FindPageParams): Promise<PageFilterDetails> {
    return this.client.filters.getFiltersPaginated({
      filterName: query,
      startAt,
      expand: "jql",
    });
  }
}
