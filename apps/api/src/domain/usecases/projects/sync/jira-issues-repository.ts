import { Injectable } from "@nestjs/common";
import { Domain } from "@entities/domains";
import { SearchIssuesResult } from "@agileplanning-io/flow-data";

@Injectable()
export abstract class JiraIssuesRepository {
  abstract search(domain: Domain, jql: string): Promise<SearchIssuesResult>;
}
