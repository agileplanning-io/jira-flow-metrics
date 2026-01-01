import {
  DataSourcesRepository,
  SearchDataSourcesParams,
} from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";
import { createLinearClient } from "../client/linear-client";
import {
  DataSource,
  MetricsClient,
  JiraMetricsClient,
  LinearMetricsClient,
} from "@agileplanning-io/flow-data";

@Injectable()
export class HttpDataSourcesRepository implements DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    // console.info({ domain });
    const client = await this.createClient(domain);

    return await client.findDataSources(query);
  }

  private async createClient(
    domain: SearchDataSourcesParams["domain"],
  ): Promise<MetricsClient> {
    // TODO: create data source client
    return domain.host === "api.linear.app"
      ? await this.createLinearDataSourcesClient(domain)
      : await this.createJiraDataSourcesClient(domain);
  }

  private async createLinearDataSourcesClient(
    domain: SearchDataSourcesParams["domain"],
  ) {
    const client = await createLinearClient(domain);
    return new LinearMetricsClient(client);
  }

  private async createJiraDataSourcesClient(
    domain: SearchDataSourcesParams["domain"],
  ) {
    const client = await createJiraClient(domain);
    return new JiraMetricsClient(client);
  }
}
