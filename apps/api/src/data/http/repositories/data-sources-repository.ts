import { DataSource, DataSourcesRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";
import { findDataSources } from "@agileplanning-io/flow-data";

@Injectable()
export class HttpJiraDataSourcesRepository extends DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    const client = await createJiraClient(domain);
    return findDataSources(client, query);
  }
}
