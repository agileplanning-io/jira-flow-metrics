import { Issue, Status, StatusCategory } from "../issues";
import { calculateWip, WipType } from "./wip";
import { buildIssue } from "../fixtures";
import { addDays, startOfDay } from "date-fns";

describe("calculateWip", () => {
  const startTime = new Date("2024-03-01T10:30:00.000Z");
  const startDate = startOfDay(startTime);

  const backlogStatus: Status = {
    name: "Backlog",
    category: StatusCategory.ToDo,
    jiraId: "123",
  };

  const inProgressStatus: Status = {
    name: "In Progress",
    category: StatusCategory.InProgress,
    jiraId: "456",
  };

  const doneStatus: Status = {
    name: "Done",
    category: StatusCategory.Done,
    jiraId: "789",
  };

  const issue1Started = startTime;
  const issue1Completed = addDays(startTime, 2);

  const issue1 = buildIssue({
    metrics: {
      started: issue1Started,
      completed: issue1Completed,
    },
    transitions: [
      {
        date: issue1Started,
        fromStatus: backlogStatus,
        toStatus: inProgressStatus,
      },
      {
        date: issue1Completed,
        fromStatus: inProgressStatus,
        toStatus: doneStatus,
      },
    ],
  });

  const issue2Started = addDays(startTime, 1);
  const issue2Paused = addDays(startTime, 2);
  const issue2Resumed = addDays(startTime, 3);
  const issue2Completed = addDays(startTime, 4);

  const issue2 = buildIssue({
    metrics: {
      started: issue2Started,
      completed: issue2Completed,
    },
    transitions: [
      {
        date: issue2Started,
        fromStatus: backlogStatus,
        toStatus: inProgressStatus,
      },
      {
        date: issue2Paused,
        fromStatus: inProgressStatus,
        toStatus: backlogStatus,
      },
      {
        date: issue2Resumed,
        fromStatus: backlogStatus,
        toStatus: inProgressStatus,
      },
      {
        date: issue2Completed,
        fromStatus: inProgressStatus,
        toStatus: doneStatus,
      },
    ],
  });
  const issues: Issue[] = [issue1, issue2];

  it("counts WIP using the LeadTime type", () => {
    const wip = calculateWip({
      issues,
      range: {
        start: startDate,
        end: addDays(startDate, 6),
      },
      wipType: WipType.LeadTime,
      includeStoppedIssues: false,
    });

    expect(wip).toEqual([
      { date: startDate, count: 0, issues: [] },
      { date: addDays(startDate, 1), count: 1, issues: [issue1] },
      { date: addDays(startDate, 2), count: 2, issues: [issue1, issue2] },
      { date: addDays(startDate, 3), count: 1, issues: [issue2] },
      { date: addDays(startDate, 4), count: 1, issues: [issue2] },
      { date: addDays(startDate, 5), count: 0, issues: [] },
    ]);
  });

  it("counts WIP using the Status type", () => {
    const wip = calculateWip({
      issues,
      range: {
        start: startDate,
        end: addDays(startDate, 6),
      },
      wipType: WipType.Status,
      includeStoppedIssues: false,
    });

    expect(wip).toEqual([
      { date: startDate, count: 0, issues: [] },
      { date: addDays(startDate, 1), count: 1, issues: [issue1] },
      { date: addDays(startDate, 2), count: 2, issues: [issue1, issue2] },
      { date: addDays(startDate, 3), count: 0, issues: [] }, // issue2 is paused here
      { date: addDays(startDate, 4), count: 1, issues: [issue2] },
      { date: addDays(startDate, 5), count: 0, issues: [] },
    ]);
  });
});
