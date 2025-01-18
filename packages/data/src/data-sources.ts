import { Version3Client } from "jira.js";
import { getAllPages } from "./page-utils";
import { flat } from "remeda";

export type DataSource = {
  name: string;
  type: "filter" | "project";
  jql: string;
};

export const findDataSources = async (
  client: Version3Client,
  query: string,
) => {
  const normalisedQuery = query?.toLowerCase();

  const projects = await findProjects(client, query);
  const filters = await findFilters(client, query);

  const dataSources = [...projects, ...filters];

  return dataSources.filter(
    (dataSource) => dataSource.name?.toLowerCase().includes(normalisedQuery),
  );
};

const findFilters = async (
  client: Version3Client,
  query: string,
): Promise<DataSource[]> => {
  const filterPages = await getAllPages(async (startAt) =>
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
};

const findProjects = async (
  client: Version3Client,
  query: string,
): Promise<DataSource[]> => {
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
};
