import { getAllPages } from "../jira/page-utils";
import { flat } from "remeda";
import { JiraClient } from "../jira/jira-client";
import { HttpLinearClient } from "../linear";

type BaseDataSource = {
  name: string;
};

export type JiraDataSource = BaseDataSource & {
  type: "filter" | "project";
  jql: string;
};

export type LinearDataSource = BaseDataSource & {
  type: "team";
  id: string;
};

export type DataSource = JiraDataSource | LinearDataSource;

export interface MetricsClient {
  findDataSources: (query: string) => Promise<DataSource[]>;
}

export class JiraMetricsClient implements MetricsClient {
  constructor(private readonly client: JiraClient) {}

  async findDataSources(query: string): Promise<DataSource[]> {
    const normalisedQuery = query?.toLowerCase();

    const projects = await findProjects(this.client, query);
    const filters = await findFilters(this.client, query);

    const dataSources = [...projects, ...filters];

    return dataSources.filter(
      (dataSource) => dataSource.name?.toLowerCase().includes(normalisedQuery),
    );
  }
}

const findFilters = async (
  client: JiraClient,
  query: string,
): Promise<DataSource[]> => {
  const filterPages = await getAllPages(async (startAt) =>
    client.findFilters({
      query,
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
};

const findProjects = async (
  client: JiraClient,
  query: string,
): Promise<DataSource[]> => {
  const projectPages = await getAllPages((startAt) =>
    client.findProjects({
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
};

export class LinearMetricsClient implements MetricsClient {
  constructor(private readonly client: HttpLinearClient) {}

  async findDataSources(query: string): Promise<DataSource[]> {
    const teams = await this.client.findTeams(query);

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      type: "team",
    }));
  }
}
