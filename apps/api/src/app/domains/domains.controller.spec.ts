import { Test, TestingModule } from "@nestjs/testing";
import { DomainsModule } from "./domains.module";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { DomainsRepository } from "@entities/domains";
import { DataModule } from "@data/data-module";
import { StorageModule } from "@data/storage/storage-module";
import { TestStorageModule } from "@fixtures/data/storage/test-storage-module";
import { ProjectsRepository } from "@entities/projects";
import { StatusCategory } from "@agileplanning-io/flow-metrics";

describe("DomainsController", () => {
  let app: INestApplication;
  let domains: DomainsRepository;
  let projects: ProjectsRepository;

  const domainId = "EIleBQKUNZj6";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule, DomainsModule],
    })
      .overrideModule(StorageModule)
      .useModule(TestStorageModule)
      .compile();
    app = module.createNestApplication();
    await app.init();

    domains = await module.resolve(DomainsRepository);
    projects = await module.resolve(ProjectsRepository);
  });

  describe("GET /domains", () => {
    it("returns a list of domains", async () => {
      await domains.addDomain({
        host: "jira.example.com",
        email: "me@example.com",
        token: "my-secret-token",
      });

      await request(app.getHttpServer())
        .get("/domains")
        .expect(200, [
          {
            id: "EIleBQKUNZj6",
            host: "jira.example.com",
            credentials: "me@example.com (***ken)",
          },
        ]);
    });
  });

  describe("POST /domains", () => {
    it("creates a new domain", async () => {
      const params = {
        host: "https://jira.example.com",
        email: "me@example.com",
        token: "my-secret-token",
      };

      await request(app.getHttpServer())
        .post("/domains")
        .send(params)
        .expect(201, {
          id: "EIleBQKUNZj6",
          host: "jira.example.com",
          credentials: "me@example.com (***ken)",
        });

      const [domain] = await domains.getDomains();

      expect(domain).toEqual({
        ...domain,
        id: "EIleBQKUNZj6",
      });
    });
  });

  describe("GET /domains/:domainId/projects", () => {
    it("returns stored projects", async () => {
      const project = await projects.addProject({
        domainId,
        name: "My Project",
        jql: "proj = MyProject",
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
      });

      await request(app.getHttpServer())
        .get(`/domains/${domainId}/projects`)
        .expect(200, [project]);
    });
  });

  describe("POST /domains/:domainId/projects", () => {
    it("stores projects", async () => {
      const params = {
        name: "My Project",
        jql: "proj = MyProject",
      };

      await request(app.getHttpServer())
        .post(`/domains/${domainId}/projects`)
        .send(params)
        .expect(201, {
          id: "KEPzzuIqHfHc",
          domainId,
          labels: [],
          components: [],
          issueTypes: [],
          ...params,
        });
    });
  });
});
