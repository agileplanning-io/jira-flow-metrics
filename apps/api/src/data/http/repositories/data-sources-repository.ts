import { DataSource, DataSourcesRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import { createJiraClient } from "../client/jira-client";

@Injectable()
export class HttpJiraDataSourcesRepository extends DataSourcesRepository {
  async getDataSources({ domain, query }): Promise<DataSource[]> {
    const client = createJiraClient(domain);
    const projectsPage = await client.projects.searchProjects({
      query,
    });

    const filtersPage = await client.filters.getFiltersPaginated({
      filterName: query,
      expand: "jql",
    });

    const projects: DataSource[] = projectsPage.values.map((project) => ({
      name: `${project.name} (${project.key})`,
      jql: `project=${project.key}`,
      type: "project",
    }));

    const filters: DataSource[] =
      filtersPage.values?.map((filter) => ({
        name: filter.name,
        jql: filter.jql ?? "",
        type: "filter",
      })) ?? [];

    return [...projects, ...filters];
  }
}
