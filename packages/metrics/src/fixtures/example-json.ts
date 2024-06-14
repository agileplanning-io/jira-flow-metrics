import { Field, Status } from "../issues";
import { Version3Models } from "jira.js";

export const exampleIssue: Version3Models.Issue = {
  expand:
    "operations,versionedRepresentations,editmeta,changelog,renderedFields",
  id: "19380",
  self: "https://example.atlassian.net/rest/api/3/issue/19380",
  key: "TEST-101",
  changelog: {
    startAt: 0,
    maxResults: 13,
    total: 13,
    histories: [
      {
        id: "130462",
        created: "2023-09-06T12:33:18.235+0100",
        items: [
          {
            field: "Rank",
            fieldtype: "custom",
            fieldId: "customfield_10022",
            from: "",
            fromString: "",
            to: "",
            toString: "Ranked higher",
          },
        ],
      },
      {
        id: "130461",
        created: "2023-09-06T12:33:17.923+0100",
        items: [
          {
            field: "resolution",
            fieldtype: "jira",
            fieldId: "resolution",
            from: null,
            fromString: null,
            to: "10000",
            toString: "Done",
          },
          {
            field: "status",
            fieldtype: "jira",
            fieldId: "status",
            from: "10071",
            fromString: "In staging",
            to: "10068",
            toString: "Done",
          },
        ],
      },
      {
        id: "130460",
        created: "2023-09-06T12:32:54.488+0100",
        items: [
          {
            field: "status",
            fieldtype: "jira",
            fieldId: "status",
            from: "10070",
            fromString: "In review",
            to: "10071",
            toString: "In staging",
          },
        ],
      },
      {
        id: "130372",
        created: "2023-09-06T09:02:11.840+0100",
        items: [
          {
            field: "status",
            fieldtype: "jira",
            fieldId: "status",
            from: "10067",
            fromString: "In Progress",
            to: "10070",
            toString: "In review",
          },
        ],
      },
      {
        id: "130338",
        created: "2023-09-05T15:22:32.292+0100",
        items: [
          {
            field: "Rank",
            fieldtype: "custom",
            fieldId: "customfield_10022",
            from: "",
            fromString: "",
            to: "",
            toString: "Ranked lower",
          },
        ],
      },
      {
        id: "130337",
        created: "2023-09-05T15:22:32.068+0100",
        items: [
          {
            field: "status",
            fieldtype: "jira",
            fieldId: "status",
            from: "10066",
            fromString: "Ready for Development",
            to: "10067",
            toString: "In Progress",
          },
        ],
      },
      {
        id: "130216",
        created: "2023-09-05T09:47:18.962+0100",
        items: [
          {
            field: "assignee",
            fieldtype: "jira",
            fieldId: "assignee",
            from: null,
            fromString: null,
            to: "636d02f29cde5926182a2eb6",
            toString: "Some person",
          },
        ],
      },
      {
        id: "130145",
        created: "2023-09-04T14:38:13.325+0100",
        items: [
          {
            field: "Rank",
            fieldtype: "custom",
            fieldId: "customfield_10022",
            from: "",
            fromString: "",
            to: "",
            toString: "Ranked higher",
          },
        ],
      },
      {
        id: "130144",
        created: "2023-09-04T14:38:05.028+0100",
        items: [
          {
            field: "Rank",
            fieldtype: "custom",
            fieldId: "customfield_10022",
            from: "",
            fromString: "",
            to: "",
            toString: "Ranked higher",
          },
        ],
      },
      {
        id: "130141",
        created: "2023-09-04T14:37:24.303+0100",
        items: [
          {
            field: "status",
            fieldtype: "jira",
            fieldId: "status",
            from: "10069",
            fromString: "backlog",
            to: "10066",
            toString: "Ready for Development",
          },
        ],
      },
      {
        id: "130103",
        created: "2023-09-04T11:03:44.143+0100",
        items: [
          {
            field: "IssueParentAssociation",
            fieldtype: "jira",
            from: null,
            fromString: null,
            to: "19227",
            toString: "19227",
          },
        ],
      },
    ],
  },
  fields: {
    summary: "My test issue",
    issuetype: {
      self: "https://example.atlassian.net/rest/api/3/issuetype/10042",
      id: "10042",
      description: "Tasks track small, distinct pieces of work.",
      iconUrl:
        "https://example.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      name: "Task",
      subtask: false,
      avatarId: 10318,
      entityId: "e2fa20f2-1dfb-456d-80c3-362d7cacf0c5",
      hierarchyLevel: 0,
    },
    created: "2023-09-04T11:03:25.333+0100",
    resolution: {
      self: "https://example.atlassian.net/rest/api/3/resolution/10000",
      id: "10000",
      description: "Work has been completed on this issue.",
      name: "Done",
    },
    labels: ["my-label"],
    components: [{ name: "my-component" }],
    customfield_10014: null,
    status: {
      self: "https://example.atlassian.net/rest/api/3/status/10068",
      description: "",
      iconUrl: "https://example.atlassian.net/",
      name: "Done",
      id: "10068",
      statusCategory: {
        self: "https://example.atlassian.net/rest/api/3/statuscategory/3",
        id: 3,
        key: "done",
        colorName: "green",
        name: "Done",
      },
    },
  },
} as unknown as Version3Models.Issue;

export const exampleFields: Field[] = [
  {
    jiraId: "issuetype",
    name: "Issue Type",
  },
  {
    jiraId: "resolution",
    name: "Resolution",
  },
  {
    jiraId: "created",
    name: "Created",
  },
  {
    jiraId: "status",
    name: "Status",
  },
  {
    jiraId: "summary",
    name: "Summary",
  },
];

export const exampleStatuses: Status[] = [
  {
    jiraId: "10066",
    name: "Ready for Development",
    category: "To Do",
  },
  {
    jiraId: "10067",
    name: "In Progress",
    category: "In Progress",
  },
  {
    jiraId: "10068",
    name: "Done",
    category: "Done",
  },
  {
    jiraId: "10069",
    name: "backlog",
    category: "To Do",
  },
  {
    jiraId: "10070",
    name: "In review",
    category: "In Progress",
  },
  {
    jiraId: "10071",
    name: "In staging",
    category: "In Progress",
  },
] as Status[];
