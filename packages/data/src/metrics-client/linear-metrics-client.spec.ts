import { mock } from "jest-mock-extended";
import { HttpLinearClient, Team } from "../linear";
import { LinearMetricsClient } from "./linear-metrics-client";

describe("LinearMetricsClient", () => {
  it("searches Linear matching data sources", async () => {
    const teams: Team[] = [{ id: "1", name: "My Team" }];

    const client = buildLinearClient(teams);
    const metricsClient = new LinearMetricsClient(client);

    const dataSources = await metricsClient.findDataSources("team");

    expect(dataSources).toEqual([{ id: "1", name: "My Team", type: "team" }]);
  });
});

const buildLinearClient = (teams: Team[]) => {
  const client = mock<HttpLinearClient>();

  client.findTeams.mockResolvedValue(teams);

  return client;
};
