import Linear, { LinearClient } from "@linear/sdk";

export type Team = Pick<Linear.Team, "id" | "name">;

export class HttpLinearClient {
  constructor(
    readonly host: string,
    private readonly client: LinearClient,
  ) {}

  async findTeams(query: string): Promise<Team[]> {
    return (
      await this.client.teams({
        filter: { name: { containsIgnoreCase: query } },
      })
    ).nodes;
  }
}
