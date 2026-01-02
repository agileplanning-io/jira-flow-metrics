import { flat } from "remeda";
import { DataSource } from "../data-sources/data-sources";
import { getAllPages, JiraClient } from "../jira";
import { MetricsClient } from "./types";

export class JiraMetricsClient implements MetricsClient {
  constructor(private readonly client: JiraClient) {}

  async findDataSources(query: string): Promise<DataSource[]> {
    const normalisedQuery = query?.toLowerCase();

    const projects = await this.findProjects(query);
    const filters = await this.findFilters(query);

    const dataSources = [...projects, ...filters];

    return dataSources.filter(
      (dataSource) => dataSource.name?.toLowerCase().includes(normalisedQuery),
    );
  }

  private async findProjects(query: string): Promise<DataSource[]> {
    const projectPages = await getAllPages((startAt) =>
      this.client.findProjects({ query, startAt }),
    );

    return flat(
      projectPages.map((page) =>
        page.values.map((project) => ({
          name: `${project.name} (${project.key})`,
          jql: `project=${project.key}`,
          type: "project" as const,
        })),
      ),
    );
  }

  private async findFilters(query: string): Promise<DataSource[]> {
    const filterPages = await getAllPages(async (startAt) =>
      this.client.findFilters({ query, startAt }),
    );

    return flat(
      filterPages.map(
        (page) =>
          page.values?.map((filter) => ({
            name: filter.name,
            jql: filter.jql ?? "",
            type: "filter" as const,
          })) ?? [],
      ),
    );
  }
}
