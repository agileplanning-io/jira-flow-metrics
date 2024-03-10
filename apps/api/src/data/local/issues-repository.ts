import { Injectable } from "@nestjs/common";
import { DataError } from "node-json-db";
import { IssuesRepository } from "@entities/issues";
import { DataCache } from "@data/storage/storage";
import { Issue } from "@agileplanning-io/flow-metrics";

@Injectable()
export class LocalIssuesRepository extends IssuesRepository {
  constructor(private readonly cache: DataCache) {
    super();
  }

  async getIssues(projectId: string): Promise<Issue[]> {
    try {
      const issues = await this.cache.getObject<Record<string, Issue>>(
        issuesPath(projectId),
      );
      return Object.values(issues);
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      throw e;
    }
  }

  async setIssues(projectId: string, issues: Issue[]) {
    await this.cache.delete(issuesPath(projectId));
    await this.cache.push(
      issuesPath(projectId),
      Object.fromEntries(issues.map((issue) => [issue.key, issue])),
    );
  }
}

const issuesPath = (projectId: string) => `/projects/${projectId}/issues`;
