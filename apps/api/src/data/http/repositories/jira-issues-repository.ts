import { Injectable } from "@nestjs/common";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { createJiraClient } from "../client/jira-client";
import { searchIssues, SearchIssuesResult } from "@agileplanning-io/flow-data";

@Injectable()
export class HttpJiraIssuesRepository extends JiraIssuesRepository {
  async search(domain, jql: string): Promise<SearchIssuesResult> {
    const client = createJiraClient(domain);
    return searchIssues(client, jql, domain.host);
  }
}
