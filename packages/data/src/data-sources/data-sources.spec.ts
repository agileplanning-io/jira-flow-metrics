import { mock } from "jest-mock-extended";
import { Version3Models } from "jira.js";
import { JiraClient } from "../jira";
import { JiraMetricsClient } from "./data-sources";

describe("findDataSources", () => {
  const projectLead = mock<Version3Models.User>();

  it("searches Jira matching data sources", async () => {
    const projects = [
      { id: "1", lead: projectLead, name: "My Project", key: "MYPROJ" },
    ];
    const filters = [{ name: "My Project Filter", jql: "project = MYPROJ" }];
    const client = buildClient(projects, filters);
    const metricsClient = new JiraMetricsClient(client);

    const dataSources = await metricsClient.findDataSources("proj");

    expect(dataSources).toEqual([
      {
        host: client.host,
        name: "My Project (MYPROJ)",
        jql: "project=MYPROJ",
        type: "project",
      },
      {
        host: client.host,
        name: "My Project Filter",
        jql: "project = MYPROJ",
        type: "filter",
      },
    ]);
  });

  it("filters data sources by the query text", async () => {
    const filters = [
      // this filter includes the query term ("proj")
      { name: "My Project Filter", jql: "project = MYPROJ" },
      // this filter doesn't, so should be excluded
      { name: "Another Filter", jql: "filter = another_filter" },
    ];
    const client = buildClient([], filters);
    const metricsClient = new JiraMetricsClient(client);

    const dataSources = await metricsClient.findDataSources("proj");

    expect(dataSources).toEqual([
      {
        host: client.host,
        name: "My Project Filter",
        jql: "project = MYPROJ",
        type: "filter",
      },
    ]);
  });
});

const buildClient = (
  jiraProjects: Version3Models.Project[],
  jiraFilters: Version3Models.FilterDetails[],
) => {
  const client = mock<JiraClient>();

  client.findProjects.mockResolvedValue(buildPageResponse(jiraProjects));
  client.findFilters.mockResolvedValue(buildPageResponse(jiraFilters));

  return client;
};

const buildPageResponse = <T>(values: T[]) => ({
  self: "https://example.com/self",
  values,
  startAt: 0,
  maxResults: 10,
  total: values.length,
  isLast: true,
});
