import { Global, Module } from "@nestjs/common";
import {
  DataSourcesRepository,
  PoliciesRepository,
  ProjectsRepository,
} from "@entities/projects";
import { LocalProjectsRepository } from "./local/repositories/projects-repository";
import { DomainsRepository } from "@entities/domains";
import { LocalDomainsRepository } from "./local/repositories/domains-repository";
import { HttpDataSourcesRepository } from "./http/repositories/data-sources-repository";
import { IssuesRepository } from "@entities/issues";
import { LocalIssuesRepository } from "./local/issues-repository";
import { HttpSearchIssuesRepository } from "./http/repositories/jira-issues-repository";
import { StorageModule } from "./storage/storage-module";
import { LocalPoliciesRepository } from "./local/repositories/policies-repository";
import { SearchIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";

@Global()
@Module({
  imports: [StorageModule],
  providers: [
    {
      provide: DomainsRepository,
      useClass: LocalDomainsRepository,
    },
    {
      provide: ProjectsRepository,
      useClass: LocalProjectsRepository,
    },
    {
      provide: PoliciesRepository,
      useClass: LocalPoliciesRepository,
    },
    {
      provide: IssuesRepository,
      useClass: LocalIssuesRepository,
    },
    {
      provide: DataSourcesRepository,
      useClass: HttpDataSourcesRepository,
    },
    {
      provide: SearchIssuesRepository,
      useClass: HttpSearchIssuesRepository,
    },
  ],
  exports: [
    DomainsRepository,
    ProjectsRepository,
    PoliciesRepository,
    DataSourcesRepository,
    IssuesRepository,
    SearchIssuesRepository,
  ],
})
export class DataModule {}
