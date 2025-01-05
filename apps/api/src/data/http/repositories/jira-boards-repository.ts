import { Injectable } from "@nestjs/common";
import { createAgileClient } from "../client/jira-client";
import { Domain } from "@entities/domains";
import { BoardSource, BoardsRepository } from "@entities/projects";

@Injectable()
export class HttpJiraBoardsRepository implements BoardsRepository {
  async getBoards(domain: Domain, query: string): Promise<BoardSource[]> {
    const client = createAgileClient(domain);

    const boards = await client.board.getAllBoards({
      projectKeyOrId: "MET", // TODO: paging
      name: query,
    });

    console.info(boards.values[0]?.location);

    return boards.values.map((board) => ({
      id: board.id,
      name: board.name,
      type: board.type,
      location: board.location?.displayName,
    }));
  }
}
