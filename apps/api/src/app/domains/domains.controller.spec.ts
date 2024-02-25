import { Test, TestingModule } from "@nestjs/testing";
import { DomainsModule } from "./domains.module";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { DomainsRepository } from "@entities/domains";
import { DataModule } from "@data/data-module";
import { StorageModule } from "@data/storage/storage-module";
import { TestStorageModule } from "@fixtures/data/storage/test-storage-module";
import { DatasetsRepository } from "@entities/datasets";
import { StatusCategory } from "@agileplanning-io/flow-metrics";

describe("DomainsController", () => {
  let app: INestApplication;
  let domains: DomainsRepository;
  let datasets: DatasetsRepository;

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
    datasets = await module.resolve(DatasetsRepository);
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
        id: "EIleBQKUNZj6",
        ...domain,
      });
    });
  });

  describe("GET /domains/:domainId/datasets", () => {
    it("returns stored datasets", async () => {
      const dataset = await datasets.addDataset({
        domainId,
        name: "My Dataset",
        jql: "proj = MyProject",
        workflow: [
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
        labels: [],
        components: [],
      });

      await request(app.getHttpServer())
        .get(`/domains/${domainId}/datasets`)
        .expect(200, [dataset]);
    });
  });

  describe("POST /domains/:domainId/datasets", () => {
    it("stores datasets", async () => {
      const params = {
        name: "My Dataset",
        jql: "proj = MyProject",
      };

      await request(app.getHttpServer())
        .post(`/domains/${domainId}/datasets`)
        .send(params)
        .expect(201, {
          id: "LO9BX58c5htj",
          domainId,
          statuses: [],
          labels: [],
          components: [],
          ...params,
        });
    });
  });
});
