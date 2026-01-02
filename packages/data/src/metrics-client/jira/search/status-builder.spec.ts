import { StatusCategory } from "@agileplanning-io/flow-metrics";
import { StatusBuilder } from "./status-builder";

describe("StatusBuilder", () => {
  it("titleizes status names", () => {
    const jiraStatuses = [
      {
        jiraId: "123",
        name: "To do",
        category: StatusCategory.ToDo,
      },
      {
        jiraId: "456",
        name: "in progress",
        category: StatusCategory.InProgress,
      },
      {
        jiraId: "789",
        name: "DONE",
        category: StatusCategory.Done,
      },
    ];

    const builder = new StatusBuilder(jiraStatuses);

    const statuses = jiraStatuses.map((jiraStatus) =>
      builder.getStatus(jiraStatus.jiraId, jiraStatus.name),
    );

    expect(statuses).toEqual([
      {
        name: "To Do",
        category: StatusCategory.ToDo,
      },
      {
        name: "In Progress",
        category: StatusCategory.InProgress,
      },
      {
        name: "Done",
        category: StatusCategory.Done,
      },
    ]);
  });
});
