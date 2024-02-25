import { Injectable } from "@nestjs/common";
import { Domain } from "@entities/domains";
import { JiraIssueBuilder, Field, Status, Issue } from "@agileplanning-io/flow-metrics";

export type SearchParams = {
  jql: string;
  onProgress: (pageIndex: number, total: number) => void;
  builder: JiraIssueBuilder;
};

@Injectable()
export abstract class JiraIssuesRepository {
  abstract getFields(domain: Domain): Promise<Field[]>;
  abstract getStatuses(domain: Domain): Promise<Status[]>;
  abstract search(domain: Domain, params: SearchParams): Promise<Issue[]>;
}
