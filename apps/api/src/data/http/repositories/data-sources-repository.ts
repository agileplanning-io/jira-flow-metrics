import { DataSet, DataSetsRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";
import { findDataSets } from "@agileplanning-io/flow-data";

@Injectable()
export class HttpJiraDataSetsRepository extends DataSetsRepository {
  async getDataSets({ domain, query }): Promise<DataSet[]> {
    const client = createJiraClient(domain);
    return findDataSets(client, query);
  }
}
