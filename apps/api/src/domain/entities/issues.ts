import { Issue } from "@agileplanning-io/flow-metrics";

export abstract class IssuesRepository {
  abstract getIssues(projectId: string): Promise<Issue[]>;
  abstract setIssues(projectId: string, issues: Issue[]): Promise<void>;
}
