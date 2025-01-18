import { Injectable } from "@nestjs/common";
import { Domain } from "@entities/domains";
import { Issue } from "@agileplanning-io/flow-metrics";

@Injectable()
export abstract class JiraIssuesRepository {
  abstract search(domain: Domain, jql: string): Promise<Issue[]>;
}
