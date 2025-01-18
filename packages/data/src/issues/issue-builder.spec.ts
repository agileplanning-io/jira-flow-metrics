import { JiraIssueBuilder } from "./issue_builder";
import {
  exampleFields,
  exampleIssue,
  exampleStatuses,
} from "../fixtures/example-json";
import { StatusBuilder } from "./status-builder";

const now = new Date("2023-09-07T10:30:00.000Z");
jest.useFakeTimers().setSystemTime(now);

describe("JiraIssueBuilder", () => {
  it("builds the issue and transition history with the given statuses", () => {
    const statusBuilder = new StatusBuilder(exampleStatuses);
    const builder = new JiraIssueBuilder(
      exampleFields,
      statusBuilder,
      "example.atlassian.net",
    );

    const result = builder.build(exampleIssue);

    expect(result).toEqual({
      key: "TEST-101",
      externalUrl: "https://example.atlassian.net/browse/TEST-101",
      summary: "My test issue",
      issueType: "Task",
      resolution: "Done",
      hierarchyLevel: "Story",
      status: "Done",
      statusCategory: "Done",
      created: new Date("2023-09-04T10:03:25.333Z"),
      labels: ["my-label"],
      components: ["my-component"],
      transitions: [
        {
          timeInStatus: 0.14858796296296295,
          fromStatus: {
            name: "Created",
            category: "To Do",
          },
          date: new Date("2023-09-04T10:03:25.333Z"),
          toStatus: {
            name: "Backlog",
            category: "To Do",
          },
          until: new Date("2023-09-04T13:37:24.303Z"),
        },
        {
          timeInStatus: 1.0313310185185185,
          date: new Date("2023-09-04T13:37:24.303Z"),
          fromStatus: {
            name: "Backlog",
            category: "To Do",
          },
          toStatus: {
            name: "Ready For Development",
            category: "To Do",
          },
          until: new Date("2023-09-05T14:22:32.068Z"),
        },
        {
          timeInStatus: 0.7358680555555556,
          date: new Date("2023-09-05T14:22:32.068Z"),
          fromStatus: {
            name: "Ready For Development",
            category: "To Do",
          },
          toStatus: {
            name: "In Progress",
            category: "In Progress",
          },
          until: new Date("2023-09-06T08:02:11.840Z"),
        },
        {
          timeInStatus: 0.14631944444444445,
          date: new Date("2023-09-06T08:02:11.840Z"),
          fromStatus: {
            name: "In Progress",
            category: "In Progress",
          },
          toStatus: {
            name: "In Review",
            category: "In Progress",
          },
          until: new Date("2023-09-06T11:32:54.488Z"),
        },
        {
          timeInStatus: 0.0002662037037037037,
          date: new Date("2023-09-06T11:32:54.488Z"),
          fromStatus: {
            name: "In Review",
            category: "In Progress",
          },
          toStatus: {
            name: "In Staging",
            category: "In Progress",
          },
          until: new Date("2023-09-06T11:33:17.923Z"),
        },
        {
          timeInStatus: 0.9560416666666667,
          date: new Date("2023-09-06T11:33:17.923Z"),
          fromStatus: {
            name: "In Staging",
            category: "In Progress",
          },
          toStatus: {
            name: "Done",
            category: "Done",
          },
          until: now,
        },
      ],
      metrics: {},
    });
  });
});
