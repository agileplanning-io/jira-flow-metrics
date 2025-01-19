import { getAllPages } from "../jira/page-utils";
import { flat } from "remeda";
import { JiraClient } from "../jira/jira-client";

export type DataSource = {
  name: string;
  type: "filter" | "project";
  jql: string;
};

export const findDataSources = async (client: JiraClient, query: string) => {
  const normalisedQuery = query?.toLowerCase();

  const projects = await findProjects(client, query);
  const filters = await findFilters(client, query);

  const dataSources = [...projects, ...filters];

  return dataSources.filter(
    (dataSource) => dataSource.name?.toLowerCase().includes(normalisedQuery),
  );
};

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
