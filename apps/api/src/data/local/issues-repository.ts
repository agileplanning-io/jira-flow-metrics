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

  async getIssues(datasetId: string): Promise<Issue[]> {
    try {
      const issues = await this.cache.getObject<Record<string, Issue>>(
        issuesPath(datasetId),
      );
      return Object.values(issues);
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      throw e;
    }
  }

  async setIssues(datasetId: string, issues: Issue[]) {
    await this.cache.delete(issuesPath(datasetId));
    await this.cache.push(
      issuesPath(datasetId),
      Object.fromEntries(issues.map((issue) => [issue.key, issue])),
    );
  }
}

const issuesPath = (datasetId: string) => `/datasets/${datasetId}/issues`;
