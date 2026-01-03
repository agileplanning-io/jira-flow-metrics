import { Injectable } from "@nestjs/common";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { createJiraClient } from "../client/jira-client";
import {
  IssueQuery,
  searchIssues,
  SearchIssuesResult,
} from "@agileplanning-io/flow-data";

@Injectable()
export class HttpJiraIssuesRepository extends JiraIssuesRepository {
  async search(domain, query: IssueQuery): Promise<SearchIssuesResult> {
    const client = await createJiraClient(domain);
    return searchIssues(client, query, domain.host);
  }
}
