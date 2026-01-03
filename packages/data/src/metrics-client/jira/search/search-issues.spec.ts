import { mock } from "jest-mock-extended";
import { searchIssues } from "./search-issues";
import { StatusCategory } from "@agileplanning-io/flow-metrics";
import { Version3Models } from "jira.js";
import { JiraClient } from "../jira-client";

describe("searchIssues", () => {
  const created = new Date("2024-03-01");
  const now = new Date("2024-04-01");

  jest.useFakeTimers({ now });

  it("searches for issues in Jira", async () => {
    const parentFieldId = "101";
    const client = mock<JiraClient>();

    client.getStatuses.mockResolvedValue([
      {
        id: "123",
        name: "In Review",
        statusCategory: { name: "In Progress" },
      },
    ]);

    client.getFields.mockResolvedValue([{ id: parentFieldId, name: "Parent" }]);

    client.enhancedSearch
      .calledWith(
        expect.objectContaining({
          jql: "project = MYPROJ",
          nextPageToken: undefined,
        }),
      )
      .mockResolvedValue({
        issues: [
          {
            key: "TEST-101",
            id: "456",
            // TODO: are the types correct? We only request the key field.
            fields: {} as unknown as Version3Models.Fields,
          },
        ],
      });

    client.fetchIssues
      .calledWith(
        expect.objectContaining({
          fields: [
            "key",
            "summary",
            "issuetype",
            "status",
            "resolution",
            "created",
            "labels",
            "components",
            "assignee",
            parentFieldId,
          ],
          keys: ["TEST-101"],
        }),
      )
      .mockResolvedValue({
        issues: [
          {
            key: "TEST-101",
            id: "456",
            fields: {
              status: {
                name: "In Review",
                statusCategory: { name: "In Progress" },
              },
              issuetype: { name: "Story" },
              components: [{ name: "Mobile" }],
              created: created.toISOString(),
              [parentFieldId]: {
                key: "TEST-102",
              },
            } as unknown as Version3Models.Fields, // to avoid filling out a bunch of fields we don't use
          },
        ],
      });

    const { issues, canonicalStatuses } = await searchIssues(
      client,
      "jql:project = MYPROJ",
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
        parentKey: "TEST-102",
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
      { category: StatusCategory.InProgress, name: "In Review" },
      { category: StatusCategory.ToDo, name: "Created" },
    ]);
  });
});
