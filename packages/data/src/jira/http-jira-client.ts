import { FindPageParams, JiraClient, SearchIssuesParams } from "./jira-client";
import { Version3Client, Version3Models } from "jira.js";

export class HttpJiraClient implements JiraClient {
  constructor(private readonly client: Version3Client) {}

  getFields(): Promise<Version3Models.FieldDetails[]> {
    return this.client.issueFields.getFields();
  }

  getStatuses(): Promise<Version3Models.StatusDetails[]> {
    return this.client.workflowStatuses.getStatuses();
  }

  searchIssues({
    jql,
    fields,
    startAt,
  }: SearchIssuesParams): Promise<Version3Models.SearchResults> {
    return this.client.issueSearch.searchForIssuesUsingJqlPost({
      jql,
      expand: ["changelog"],
      fields,
      startAt,
    });
  }

  async searchIssuesNew({
    jql,
  }: SearchIssuesParams): Promise<Version3Models.SearchAndReconcileResults> {
    const ids =
      await this.client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql,
        fields: ["id"],
      });

    return ids;
  }

  findProjects({
    query,
    startAt,
  }: FindPageParams): Promise<Version3Models.PageProject> {
    return this.client.projects.searchProjects({
      query,
      startAt,
    });
  }

  findFilters({
    query,
    startAt,
  }: FindPageParams): Promise<Version3Models.PageFilterDetails> {
    return this.client.filters.getFiltersPaginated({
      filterName: query,
      startAt,
      expand: "jql",
    });
  }
}
