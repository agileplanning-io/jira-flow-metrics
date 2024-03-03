import { DataModule } from "@data/data-module";
import { Test, TestingModule } from "@nestjs/testing";
import { DatasetsModule } from "./datasets.module";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { StorageModule } from "@data/storage/storage-module";
import { TestStorageModule } from "@fixtures/data/storage/test-storage-module";
import { IssuesRepository } from "@entities/issues";
import { DatasetsRepository } from "@entities/datasets";
import { StatusCategory, buildIssue } from "@agileplanning-io/flow-metrics";

jest.useFakeTimers().setSystemTime(Date.parse("2023-01-01T13:00:00.000Z"));

describe("DatasetsController", () => {
  let app: INestApplication;
  let issues: IssuesRepository;
  let datasets: DatasetsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule, DatasetsModule],
    })
      .overrideModule(StorageModule)
      .useModule(TestStorageModule)
      .compile();

    app = module.createNestApplication();
    await app.init();

    issues = await module.get(IssuesRepository);
    datasets = await module.get(DatasetsRepository);
  });

  const createDataset = async () => {
    return datasets.addDataset({
      domainId: "123",
      name: "My Dataset",
      jql: "proj=PROJ",
      workflow: [
        {
          name: "In Progress",
          selectByDefault: true,
          statuses: [
            { name: "In Progress", category: StatusCategory.InProgress },
          ],
        },
      ],
      statuses: [{ name: "In Progress", category: StatusCategory.InProgress }],
      labels: [],
      components: [],
    });
  };

  describe("GET /datasets/:datasetId/issues", () => {
    it("returns issues in the dataset", async () => {
      const { id: datasetId } = await createDataset();

      await issues.setIssues(datasetId, [
        buildIssue({
          transitions: [],
          created: new Date("2023-01-01T07:00:00.000Z"),
        }),
      ]);

      const { body } = await request(app.getHttpServer())
        .get(`/datasets/${datasetId}/issues`)
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
