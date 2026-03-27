import { Injectable } from "@nestjs/common";
import { SearchIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { createJiraClient } from "../client/jira-client";
import {
  IssueQuery,
  searchIssues,
  SearchIssuesResult,
} from "@agileplanning-io/flow-data";
import { Domain } from "@entities/domains";
import { createLinearClient } from "../client/linear-client";
import * as Linear from "@linear/sdk";
import {
  buildTransitions,
  HierarchyLevel,
  Issue,
  StatusCategory,
} from "@agileplanning-io/flow-metrics";

@Injectable()
export class HttpSearchIssuesRepository extends SearchIssuesRepository {
  async search(domain: Domain, query: IssueQuery): Promise<SearchIssuesResult> {
    return domain.host === "api.linear.app"
      ? this.searchLinearIssues(domain, query)
      : this.searchJiraIssues(domain, query);
  }

  private searchJiraIssues = async (
    domain: Domain,
    query: IssueQuery,
  ): Promise<SearchIssuesResult> => {
    const client = await createJiraClient(domain);
    return searchIssues(client, query, domain.host);
  };

  private searchLinearIssues = async (
    domain: Domain,
    query: IssueQuery,
  ): Promise<SearchIssuesResult> => {
    const client = await createLinearClient(domain);
    const issues = await client.findIssues(query);

    const makeIssue = (issue: Linear.Issue): Issue => {
      return {
        key: issue.identifier,
        summary: issue.title,
        externalUrl: "",
        hierarchyLevel: HierarchyLevel.Story,
        status: "In Progress",
        statusCategory: StatusCategory.InProgress,
        labels: issue.labelIds,
        components: [],
        created: issue.createdAt,
        transitions: buildTransitions(
          [],
          issue.createdAt,
          "To Do",
          StatusCategory.ToDo,
        ),
        metrics: {},
      };
    };

    return { issues: issues.map(makeIssue), canonicalStatuses: [] };
  };
}
