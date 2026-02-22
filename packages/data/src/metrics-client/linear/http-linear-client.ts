import Linear, { Issue, LinearClient } from "@linear/sdk";
import { getLinearTeamId, IssueQuery } from "../jira";

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

  async findIssues(query: IssueQuery): Promise<Issue[]> {
    const teamId = getLinearTeamId(query);

    return (await (await this.client.team(teamId)).issues()).nodes;
  }
}
