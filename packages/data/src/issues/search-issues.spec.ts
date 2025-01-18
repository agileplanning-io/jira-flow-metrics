import { mock } from "jest-mock-extended";
import { searchIssues } from "./search-issues";
import { Version3Client } from "jira.js";
import {
  IssueFields,
  IssueSearch,
  WorkflowStatuses,
} from "jira.js/out/version3";
import { StatusCategory } from "@agileplanning-io/flow-metrics";

describe("searchIssues", () => {
  const created = new Date("2024-03-01");
  const now = new Date("2024-04-01");

  jest.useFakeTimers({ now });

  it("searches for issues in Jira", async () => {
    const workflowStatuses = mock<WorkflowStatuses>();
    workflowStatuses.getStatuses.mockResolvedValue([
      // { id: 123, name: "In Review", statusCategory: { name: "In Progress" } },
    ]);

    const issueFields = mock<IssueFields>();
    issueFields.getFields.mockResolvedValue([]);

    const issueSearch = mock<IssueSearch>();
    issueSearch.searchForIssuesUsingJqlPost.mockResolvedValue({
      startAt: 0,
      total: 1,
      maxResults: 10,
      issues: [
        {
          key: "TEST-101",
          fields: {
            status: {
              name: "In Review",
              statusCategory: { name: "In Progress" },
            },
            issuetype: { name: "Story" },
            components: [{ name: "Mobile" }],
            created: created.toISOString(),
          },
        },
      ],
    });

    const client = mock<Version3Client>({
      issueSearch,
      issueFields,
      workflowStatuses,
    });

    const { issues, canonicalStatuses } = await searchIssues(
      client,
      "project = MYPROJ",
      "jira.example.com",
    );

    expect(issues).toEqual([
      {
        assignee: undefined,
        components: ["Mobile"],
        created,
        externalUrl: "https://jira.example.com/browse/TEST-101",
        hierarchyLevel: "Story",
        issueType: "Story",
        key: "TEST-101",
        labels: undefined,
        metrics: {},
        parentKey: undefined,
        resolution: undefined,
        status: "In Review",
        statusCategory: "In Progress",
        summary: undefined,
        transitions: [
          {
            date: created,
            fromStatus: {
              category: "To Do",
              name: "Created",
            },
            timeInStatus: 31,
            toStatus: {
              category: "In Progress",
              name: "In Review",
            },
            until: now,
          },
        ],
      },
    ]);
    expect(canonicalStatuses).toEqual([
      { category: StatusCategory.ToDo, name: "Created" },
    ]);
  });
});
