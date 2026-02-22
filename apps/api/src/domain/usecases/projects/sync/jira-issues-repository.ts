import { Injectable } from "@nestjs/common";
import { Domain } from "@entities/domains";
import { IssueQuery, SearchIssuesResult } from "@agileplanning-io/flow-data";

@Injectable()
export abstract class SearchIssuesRepository {
  abstract search(
    domain: Domain,
    query: IssueQuery,
  ): Promise<SearchIssuesResult>;
}
