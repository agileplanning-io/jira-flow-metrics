import { Injectable } from "@nestjs/common";
import { Domain } from "@entities/domains";
import { IssueQuery, SearchIssuesResult } from "@agileplanning-io/flow-data";

@Injectable()
export abstract class JiraIssuesRepository {
  abstract search(
    domain: Domain,
    query: IssueQuery,
  ): Promise<SearchIssuesResult>;
}
