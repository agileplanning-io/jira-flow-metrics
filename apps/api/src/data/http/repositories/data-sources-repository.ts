import {
  DataSource,
  DataSourcesRepository,
  SearchDataSourcesParams,
} from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";
import { findDataSources } from "@agileplanning-io/flow-data";
import { createLinearClient } from "../client/linear-client";

@Injectable()
export class HttpJiraDataSourcesRepository extends DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    // console.info({ domain });
    const client = await this.createClient(domain);
    return findDataSources(client, query);
  }

  private async createClient(domain: SearchDataSourcesParams["domain"]) {
    return domain.host === "api.linear.app"
      ? await createLinearClient(domain)
      : await createJiraClient(domain);
  }
}
