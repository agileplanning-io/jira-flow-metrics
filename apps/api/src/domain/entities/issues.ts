import { Issue } from "@agileplanning-io/flow-metrics";

export abstract class IssuesRepository {
  abstract getIssues(datasetId: string): Promise<Issue[]>;
  abstract setIssues(datasetId: string, issues: Issue[]): Promise<void>;
}
