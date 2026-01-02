import { DataSource } from "../data-sources/data-sources";
import { HttpLinearClient } from "../linear";
import { MetricsClient } from "./types";

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
