import { Global, Module } from "@nestjs/common";
import { DataSourcesRepository, ProjectsRepository } from "@entities/projects";
import { LocalProjectsRepository } from "./local/repositories/projects-repository";
import { DomainsRepository } from "@entities/domains";
import { LocalDomainsRepository } from "./local/repositories/domains-repository";
import { HttpJiraDataSourcesRepository } from "./http/repositories/data-sources-repository";
import { IssuesRepository } from "@entities/issues";
import { LocalIssuesRepository } from "./local/issues-repository";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { HttpJiraIssuesRepository } from "./http/repositories/jira-issues-repository";
import { StorageModule } from "./storage/storage-module";

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
      provide: IssuesRepository,
      useClass: LocalIssuesRepository,
    },
    {
      provide: DataSourcesRepository,
      useClass: HttpJiraDataSourcesRepository,
    },
    {
      provide: JiraIssuesRepository,
      useClass: HttpJiraIssuesRepository,
    },
  ],
  exports: [
    DomainsRepository,
    ProjectsRepository,
    DataSourcesRepository,
    IssuesRepository,
    JiraIssuesRepository,
  ],
})
export class DataModule {}
