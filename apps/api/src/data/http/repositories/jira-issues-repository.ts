import { Injectable } from "@nestjs/common";
import { Issue } from "@agileplanning-io/flow-metrics";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { createJiraClient } from "../client/jira-client";
export { searchIssues } from "@agileplanning-io/flow-data";

@Injectable()
export class HttpJiraIssuesRepository extends JiraIssuesRepository {
  async search(domain, jql: string): Promise<Issue[]> {
    const client = createJiraClient(domain);
    return searchIssues(client, jql);
  }
}
