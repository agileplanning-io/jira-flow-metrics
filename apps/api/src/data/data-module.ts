import { Global, Module } from "@nestjs/common";
import {
  BoardsRepository,
  DataSourcesRepository,
  PoliciesRepository,
  ProjectsRepository,
} from "@entities/projects";
import { LocalProjectsRepository } from "./local/repositories/projects-repository";
import { DomainsRepository } from "@entities/domains";
import { LocalDomainsRepository } from "./local/repositories/domains-repository";
import { HttpJiraDataSourcesRepository } from "./http/repositories/data-sources-repository";
import { IssuesRepository } from "@entities/issues";
import { LocalIssuesRepository } from "./local/issues-repository";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { HttpJiraIssuesRepository } from "./http/repositories/jira-issues-repository";
import { StorageModule } from "./storage/storage-module";
import { LocalPoliciesRepository } from "./local/repositories/policies-repository";
import { HttpJiraBoardsRepository } from "./http/repositories/jira-boards-repository";

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
      useClass: HttpJiraDataSourcesRepository,
    },
    {
      provide: BoardsRepository,
      useClass: HttpJiraBoardsRepository,
    },
    {
      provide: JiraIssuesRepository,
      useClass: HttpJiraIssuesRepository,
    },
  ],
  exports: [
    DomainsRepository,
    ProjectsRepository,
    PoliciesRepository,
    DataSourcesRepository,
    BoardsRepository,
    IssuesRepository,
    JiraIssuesRepository,
  ],
})
export class DataModule {}
