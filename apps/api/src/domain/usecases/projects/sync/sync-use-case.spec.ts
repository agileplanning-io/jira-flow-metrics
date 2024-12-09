import { Project, ProjectsRepository } from "@entities/projects";
import { JiraIssuesRepository } from "./jira-issues-repository";
import { SyncUseCase } from "./sync-use-case";
import mock from "jest-mock-extended/lib/Mock";
import { Domain, DomainsRepository } from "@entities/domains";
import { IssuesRepository } from "@entities/issues";
import {
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  StatusCategory,
  buildIssue,
} from "@agileplanning-io/flow-metrics";

const now = new Date("2024-01-01T10:30:00.000Z");
jest.useFakeTimers().setSystemTime(now);

const created = { name: "Created", category: StatusCategory.ToDo };
const toDo = { name: "To Do", category: StatusCategory.ToDo };
const inProgress = {
  name: "In Progress",
  category: StatusCategory.InProgress,
};
const done = { name: "Done", category: StatusCategory.Done };

describe("SyncUseCase", () => {
  it("syncs issues", async () => {
    const projectId = "projectId";
    const domainId = "domainId";
    const jiraIssues = mock<JiraIssuesRepository>();
    const projects = mock<ProjectsRepository>();
    const domains = mock<DomainsRepository>();
    const issues = mock<IssuesRepository>();

    const project: Project = {
      name: "My Project",
      id: projectId,
      domainId,
      jql: "project = MYPROJ",
      labels: [],
      components: [],
      issueTypes: [],
      resolutions: [],
    };

    const domain: Domain = {
      id: domainId,
      host: "jira.example.com",
      email: "admin@example.com",
      token: "token",
    };

    jiraIssues.getFields.mockResolvedValue([]);
    jiraIssues.getStatuses.mockResolvedValue([
      { jiraId: "todo", ...toDo },
      { jiraId: "inProgress", ...inProgress },
      { jiraId: "done", ...done },
    ]);

    const startedDate = new Date("2023-01-01T10:30:00.000Z");
    const doneDate = new Date("2023-01-01T16:30:00.000Z");

    const story1 = buildIssue({
      status: "Done",
      statusCategory: StatusCategory.Done,
      transitions: [
        {
          date: startedDate,
          fromStatus: toDo,
          toStatus: inProgress,
        },
        {
          date: doneDate,
          fromStatus: inProgress,
          toStatus: done,
        },
      ],
    });
    jiraIssues.search.mockResolvedValue([story1]);

    domains.getDomain.calledWith(domainId).mockResolvedValue(domain);

    projects.getProject.calledWith(projectId).mockResolvedValue(project);

    const sync = new SyncUseCase(projects, issues, domains, jiraIssues);

    const syncedIssues = await sync.exec(projectId);

    expect(syncedIssues).toEqual([story1]);

    expect(projects.updateProject).toBeCalledWith(projectId, {
      labels: [],
      components: [],
      resolutions: [],
      issueTypes: ["Story"],
      lastSync: {
        date: now,
        issueCount: 1,
      },
      defaultCycleTimePolicy: {
        type: CycleTimePolicyType.LeadTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.EpicStatus,
          statuses: [],
        },
      },
      defaultCompletedFilter: {},
      workflowScheme: {
        epics: {
          stages: [
            { name: "To Do", statuses: [], selectByDefault: false },
            { name: "In Progress", statuses: [], selectByDefault: true },
            { name: "Done", statuses: [], selectByDefault: false },
          ],
          statuses: [],
        },
        stories: {
          stages: [
            {
              name: "To Do",
              statuses: [created, toDo],
              selectByDefault: false,
            },
            {
              name: "In Progress",
              statuses: [inProgress],
              selectByDefault: true,
            },
            { name: "Done", statuses: [done], selectByDefault: false },
          ],
          statuses: [created, toDo, inProgress, done],
        },
      },
    });
  });
});
