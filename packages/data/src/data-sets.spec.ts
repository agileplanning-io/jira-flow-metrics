import { mock } from "jest-mock-extended";
import { Version3Client } from "jira.js";
import { findDataSets } from "./data-sets";
import { Filters, Projects } from "jira.js/out/version3";
import { Filter, Project } from "jira.js/out/version3/models";

describe("findDataSets", () => {
  it("searches Jira matching data sets", async () => {
    const projects = [{ name: "My Project", key: "MYPROJ" }];
    const filters = [{ name: "My Project Filter", jql: "project = MYPROJ" }];
    const client = buildClient(projects, filters);

    const dataSets = await findDataSets(client, "proj");

    expect(dataSets).toEqual([
      { name: "My Project (MYPROJ)", jql: "project=MYPROJ", type: "project" },
      { name: "My Project Filter", jql: "project = MYPROJ", type: "filter" },
    ]);
  });

  it("filters data sets by the query text", async () => {
    const filters = [
      // this filter includes the query term ("proj")
      { name: "My Project Filter", jql: "project = MYPROJ" },
      // this filter doesn't, so should be excluded
      { name: "Another Filter", jql: "filter = another_filter" },
    ];
    const client = buildClient([], filters);

    const dataSets = await findDataSets(client, "proj");

    expect(dataSets).toEqual([
      { name: "My Project Filter", jql: "project = MYPROJ", type: "filter" },
    ]);
  });
});

const buildClient = (
  jiraProjects: Partial<Project>[],
  jiraFilters: Partial<Filter>[],
) => {
  const projects = mock<Projects>();
  const filters = mock<Filters>();

  const client = mock<Version3Client>({ projects, filters });

  projects.searchProjects.mockResolvedValue({
    startAt: 0,
    total: 1,
    maxResults: 10,
    values: jiraProjects,
  });

  filters.getFiltersPaginated.mockResolvedValue({
    startAt: 0,
    total: 1,
    maxResults: 10,
    values: jiraFilters,
  });

  return client;
};
