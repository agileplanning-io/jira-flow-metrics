import { DataSource, DataSourcesRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";
import { flat } from "remeda";
import { Version3Client } from "jira.js";
import { getAllPages } from "./page-utils";

@Injectable()
export class HttpJiraDataSourcesRepository extends DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    const normalisedQuery = query?.toLowerCase();

    const client = createJiraClient(domain);

    const projects = await this.getProjects(client, query);
    const filters = await this.getFilters(client, query);

    const dataSources = [...projects, ...filters];

    return dataSources.filter(
      (dataSource) => dataSource.name?.toLowerCase().includes(normalisedQuery),
    );
  }

  private async getFilters(
    client: Version3Client,
    query: string,
  ): Promise<DataSource[]> {
    const filterPages = await getAllPages((startAt) =>
      client.filters.getFiltersPaginated({
        filterName: query,
        expand: "jql",
        startAt,
      }),
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

  private async getProjects(
    client: Version3Client,
    query: string,
  ): Promise<DataSource[]> {
    const projectPages = await getAllPages((startAt) =>
      client.projects.searchProjects({
        query,
        startAt,
      }),
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
}
