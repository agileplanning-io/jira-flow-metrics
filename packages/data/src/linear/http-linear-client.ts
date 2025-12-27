import { LinearClient, Team } from "@linear/sdk";
import {
  BulkIssue,
  JiraClient,
  PageFilterDetails,
  PageProject,
  SearchAndReconcileResults,
} from "../jira/jira-client";
import { JiraHost } from "../domain/hosts";

export class HttpLinearClient implements JiraClient {
  constructor(
    readonly host: JiraHost,
    private readonly client: LinearClient,
  ) {}

  getFields() {
    return Promise.resolve([]); // return this.client.issueFields.getFields();
  }

  getStatuses() {
    return Promise.resolve([]); // return this.client.workflowStatuses.getStatuses();
  }

  async enhancedSearch(): Promise<SearchAndReconcileResults> {
    return Promise.resolve({});
  }

  fetchIssues(): Promise<BulkIssue> {
    return Promise.resolve({});
  }

  async findProjects(): Promise<PageProject> {
    const teams: Team[] = (await this.client.teams()).nodes;
    return {
      values: teams.map((team) => ({
        id: team.id,
        key: team.key,
        name: team.name,
      })),
      total: teams.length,
      maxResults: teams.length,
    } as PageProject;
  }

  findFilters(): Promise<PageFilterDetails> {
    return Promise.resolve({
      values: [],
      total: 0,
      maxResults: 0,
    } as unknown as PageFilterDetails);
  }
}
