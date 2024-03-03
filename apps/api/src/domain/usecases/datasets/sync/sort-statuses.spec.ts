import {
  Issue,
  StatusCategory,
  buildIssue,
} from "@agileplanning-io/flow-metrics";
import { sortStatuses } from "./sort-statuses";
import { addHours } from "date-fns";

describe("sortStatuses", () => {
  const created = { name: "Created", category: StatusCategory.ToDo };
  const toDo = { name: "To Do", category: StatusCategory.ToDo };
  const inProgress = {
    name: "In Progress",
    category: StatusCategory.InProgress,
  };
  const done = { name: "Done", category: StatusCategory.Done };

  const t1 = new Date();
  const t2 = addHours(t1, 1);
  const t3 = addHours(t2, 1);
  const t4 = addHours(t3, 1);
  const t5 = addHours(t4, 1);

  it("drives the status order using a topological sort", () => {
    const stories: Issue[] = [
      buildIssue({
        transitions: [
          {
            fromStatus: created,
            toStatus: toDo,
            date: t1,
          },
          {
            fromStatus: toDo,
            toStatus: inProgress,
            date: t2,
          },
          {
            fromStatus: inProgress,
            toStatus: done,
            date: t3,
          },
        ],
      }),
    ];
    const sortedStatuses = sortStatuses(stories);
    expect(sortedStatuses).toEqual(["Created", "To Do", "In Progress", "Done"]);
  });

  it("ignores less travelled cycles", () => {
    const stories: Issue[] = [
      buildIssue({
        transitions: [
          {
            fromStatus: created,
            toStatus: toDo,
            date: t1,
          },
          {
            fromStatus: toDo,
            toStatus: inProgress,
            date: t2,
          },
          {
            fromStatus: inProgress,
            toStatus: done,
            date: t3,
          },
          {
            fromStatus: done,
            toStatus: inProgress,
            date: t4,
          },
          {
            fromStatus: inProgress,
            toStatus: done,
            date: t5,
          },
        ],
      }),
    ];
    const sortedStatuses = sortStatuses(stories);
    expect(sortedStatuses).toEqual(["Created", "To Do", "In Progress", "Done"]);
  });
});
