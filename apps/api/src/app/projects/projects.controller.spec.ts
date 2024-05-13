import { DataModule } from "@data/data-module";
import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsModule } from "./projects.module";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { StorageModule } from "@data/storage/storage-module";
import { TestStorageModule } from "@fixtures/data/storage/test-storage-module";
import { IssuesRepository } from "@entities/issues";
import { ProjectsRepository } from "@entities/projects";
import {
  CycleTimePolicy,
  StatusCategory,
  buildIssue,
} from "@agileplanning-io/flow-metrics";
import { qsStringify } from "@agileplanning-io/flow-lib";

jest.useFakeTimers().setSystemTime(Date.parse("2023-01-01T13:00:00.000Z"));

describe("ProjectsController", () => {
  let app: INestApplication;
  let issues: IssuesRepository;
  let projects: ProjectsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule, ProjectsModule],
    })
      .overrideModule(StorageModule)
      .useModule(TestStorageModule)
      .compile();

    app = module.createNestApplication();
    await app.init();

    issues = await module.get(IssuesRepository);
    projects = await module.get(ProjectsRepository);
  });

  const createProject = async () => {
    return projects.addProject({
      domainId: "123",
      name: "My Project",
      jql: "proj=PROJ",
      workflowScheme: {
        stories: {
          stages: [
            {
              name: "In Progress",
              selectByDefault: true,
              statuses: [
                { name: "In Progress", category: StatusCategory.InProgress },
              ],
            },
          ],
          statuses: [
            { name: "In Progress", category: StatusCategory.InProgress },
          ],
        },
        epics: {
          stages: [],
          statuses: [],
        },
      },
      labels: [],
      components: [],
      issueTypes: [],
      resolutions: [],
    });
  };

  describe("GET /projects/:projectId/issues", () => {
    it("returns issues in the project", async () => {
      const { id: projectId } = await createProject();

      await issues.setIssues(projectId, [
        buildIssue({
          transitions: [],
          created: new Date("2023-01-01T07:00:00.000Z"),
        }),
      ]);

      const policy: CycleTimePolicy = {
        stories: {
          type: "status",
          includeWaitTime: false,
        },
        epics: {
          type: "status",
          includeWaitTime: false,
        },
      };

      const { body } = await request(app.getHttpServer())
        .get(`/projects/${projectId}/issues?${qsStringify({ policy })}`)
        .expect(200);

      expect(body).toEqual([
        {
          assignee: "Test User",
          created: "2023-01-01T07:00:00.000Z",
          externalUrl: "https://jira.example.com/browse/TEST-101",
          hierarchyLevel: "Story",
          key: "TEST-101",
          metrics: {},
          status: "Backlog",
          statusCategory: "To Do",
          summary: "Some issue 101",
          issueType: "Story",
          labels: [],
          components: [],
          transitions: [
            {
              date: "2023-01-01T07:00:00.000Z",
              fromStatus: {
                category: "To Do",
                name: "Created",
              },
              timeInStatus: 0.25,
              toStatus: {
                category: "To Do",
                name: "Backlog",
              },
              until: "2023-01-01T13:00:00.000Z",
            },
          ],
        },
      ]);
    });
  });
});
