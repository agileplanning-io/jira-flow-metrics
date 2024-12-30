import { buildIssue } from "../fixtures";
import {
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  getFlowMetrics,
} from "../metrics";
import {
  HierarchyLevel,
  Issue,
  StatusCategory,
  TransitionStatus,
} from "../issues";
import { timeSpentInPeriod } from "./time-spent";

const backlog: TransitionStatus = {
  name: "Backlog",
  category: StatusCategory.ToDo,
};
const inProgress: TransitionStatus = {
  name: "In Progress",
  category: StatusCategory.InProgress,
};
const done: TransitionStatus = { name: "Done", category: StatusCategory.Done };

const inProgressStatuses = [inProgress.name];

describe("timeSpentInPeriod", () => {
  const buildIssues = (additionalIssues: Issue[] = []) => {
    const epic1 = buildIssue({
      key: "EPIC-1",
      issueType: "Epic",
      hierarchyLevel: HierarchyLevel.Epic,
    });
    const epic2 = buildIssue({
      key: "EPIC-2",
      issueType: "Epic",
      hierarchyLevel: HierarchyLevel.Epic,
    });
    const story1 = buildIssue({
      key: "STORY-1",
      parentKey: epic1.key,
      status: done.name,
      statusCategory: StatusCategory.Done,
      created: new Date("2021-01-01T10:30:00.000Z"),
      transitions: [
        {
          fromStatus: backlog,
          toStatus: inProgress,
          date: new Date("2021-01-02T10:30:00.000Z"),
        },
        {
          fromStatus: inProgress,
          toStatus: done,
          date: new Date("2021-01-06T10:30:00.000Z"),
        },
      ],
    });
    const story2 = buildIssue({
      key: "STORY-2",
      parentKey: epic2.key,
      status: done.name,
      statusCategory: StatusCategory.Done,
      created: new Date("2021-01-01T10:30:00.000Z"),
      transitions: [
        {
          fromStatus: backlog,
          toStatus: inProgress,
          date: new Date("2021-01-04T10:30:00.000Z"),
        },
        {
          fromStatus: inProgress,
          toStatus: done,
          date: new Date("2021-01-10T10:30:00.000Z"),
        },
      ],
    });

    const issues = getFlowMetrics(
      [story1, story2, epic1, epic2, ...additionalIssues],
      {
        type: CycleTimePolicyType.ProcessTime,
        statuses: [inProgress.name],
        epics: {
          type: EpicCycleTimePolicyType.EpicStatus,
          statuses: [],
        },
      },
    );

    return issues;
  };

  it("estimates time spent across epics", () => {
    const issues = buildIssues();
    const [epic1, epic2, story1, story2] = issues;

    const timeSpent = timeSpentInPeriod(
      issues,
      {
        start: new Date("2021-01-01T00:00:00.000Z"),
        end: new Date("2021-02-01T00:00:00.000Z"),
      },
      inProgressStatuses,
    );

    expect(timeSpent).toEqual([
      {
        issueCount: 2,
        key: "epics",
        percentInPeriod: 100,
        rowType: "category",
        summary: "Epics",
        timeInPeriod: 10,
        children: [
          {
            ...epic2,
            children: [
              {
                ...story2,
                percentInPeriod: 60,
                timeInPeriod: 6,
                rowType: "story",
              },
            ],
            issueCount: 1,
            percentInPeriod: 60,
            timeInPeriod: 6,
            rowType: "epic",
          },
          {
            ...epic1,
            children: [
              {
                ...story1,
                percentInPeriod: 40,
                timeInPeriod: 4,
                rowType: "story",
              },
            ],
            issueCount: 1,
            percentInPeriod: 40,
            timeInPeriod: 4,
            rowType: "epic",
          },
        ],
      },
      {
        children: [],
        issueCount: 0,
        key: "unassigned",
        percentInPeriod: 0,
        rowType: "category",
        summary: "Issues without epics",
        timeInPeriod: 0,
      },
    ]);
  });

  it("estimates time spent across individual tasks", () => {
    const issues = buildIssues([
      buildIssue({
        key: "TASK-1",
        status: done.name,
        statusCategory: StatusCategory.Done,
        created: new Date("2021-01-01T10:30:00.000Z"),
        transitions: [
          {
            fromStatus: backlog,
            toStatus: inProgress,
            date: new Date("2021-01-04T10:30:00.000Z"),
          },
          {
            fromStatus: inProgress,
            toStatus: done,
            date: new Date("2021-01-10T10:30:00.000Z"),
          },
        ],
      }),
    ]);
    const [epic1, epic2, story1, story2, task] = issues;

    const timeSpent = timeSpentInPeriod(
      issues,
      {
        start: new Date("2021-01-01T00:00:00.000Z"),
        end: new Date("2021-02-01T00:00:00.000Z"),
      },
      inProgressStatuses,
    );

    expect(timeSpent).toEqual([
      {
        issueCount: 2,
        key: "epics",
        percentInPeriod: 62.5,
        rowType: "category",
        summary: "Epics",
        timeInPeriod: 10,
        children: [
          {
            ...epic2,
            children: [
              {
                ...story2,
                percentInPeriod: 37.5,
                timeInPeriod: 6,
                rowType: "story",
              },
            ],
            issueCount: 1,
            percentInPeriod: 37.5,
            timeInPeriod: 6,
            rowType: "epic",
          },
          {
            ...epic1,
            children: [
              {
                ...story1,
                percentInPeriod: 25,
                timeInPeriod: 4,
                rowType: "story",
              },
            ],
            issueCount: 1,
            percentInPeriod: 25,
            timeInPeriod: 4,
            rowType: "epic",
          },
        ],
      },
      {
        children: [
          {
            ...task,
            percentInPeriod: 37.5,
            timeInPeriod: 6,
            rowType: "story",
          },
        ],
        issueCount: 1,
        key: "unassigned",
        percentInPeriod: 37.5,
        rowType: "category",
        summary: "Issues without epics",
        timeInPeriod: 6,
      },
    ]);
  });
});
