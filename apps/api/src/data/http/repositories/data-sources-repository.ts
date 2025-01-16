import { DataSource, DataSourcesRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { mapLimit } from "async";
import { createJiraClient } from "../client/jira-client";
import { flat, range } from "remeda";
import { Version3Client } from "jira.js";

@Injectable()
export class HttpJiraDataSourcesRepository extends DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    const client = createJiraClient(domain);
    const projectsPage = await client.projects.searchProjects({
      query,
    });

    const projects: DataSource[] = projectsPage.values.map((project) => ({
      name: `${project.name} (${project.key})`,
      jql: `project=${project.key}`,
      type: "project",
    }));

    const filters = await this.getFilters(client, query);

    return [...projects, ...filters];
  }

  private async getFilters(
    client: Version3Client,
    query: string,
  ): Promise<DataSource[]> {
    const firstPage = await client.filters.getFiltersPaginated({
      filterName: query,
      expand: "jql",
    });

    const maxResults = firstPage.maxResults;
    const total = firstPage.total;

    if (total === undefined || maxResults === undefined) {
      throw new Error(
        `Response missing fields: total=${total}, maxResults: ${maxResults}`,
      );
    }

    const pageCount = Math.ceil(total / maxResults);

    const remainingPages = await mapLimit(
      range(1, pageCount),
      5,
      async (pageIndex: number) =>
        client.filters.getFiltersPaginated({
          filterName: query,
          expand: "jql",
          startAt: pageIndex * maxResults,
        }),
    );

    return flat(
      [firstPage, ...remainingPages].map(
        (page) =>
          page.values?.map((filter) => ({
            name: filter.name,
            jql: filter.jql ?? "",
            type: "filter",
          })) ?? [],
      ),
    );
  }
}
