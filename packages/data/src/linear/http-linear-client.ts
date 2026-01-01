import { LinearClient, Team } from "@linear/sdk";

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
