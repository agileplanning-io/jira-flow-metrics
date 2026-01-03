import {
  DataSourcesRepository,
  Project,
  ProjectsRepository,
} from "@entities/projects";
import { Domain, DomainsRepository } from "@entities/domains";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { omit } from "remeda";
import { URL } from "url";
import { Issue } from "@agileplanning-io/flow-metrics";
import { IssueQuery } from "@agileplanning-io/flow-data";

class CreateDomainBody {
  @ApiProperty()
  host: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  token: string;
}

class CreateProjectBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  query: IssueQuery;
}

@Controller("domains")
export class DomainsController {
  constructor(
    private readonly domains: DomainsRepository,
    private readonly projects: ProjectsRepository,
    private readonly dataSources: DataSourcesRepository,
  ) {}

  @Get()
  async getDomains() {
    const domains = await this.domains.getDomains();
    return domains.map(domainToResponse);
  }

  @Post()
  async createDomain(@Body() params: CreateDomainBody) {
    const host = normaliseHost(params.host);
    const domain = await this.domains.addDomain({ ...params, host });
    return domainToResponse(domain);
  }

  @Delete(":domainId")
  async deleteDomain(@Param("domainId") domainId) {
    await this.projects.removeProjects(domainId);
    await this.domains.removeDomain(domainId);
  }

  @Get(":domainId/projects")
  async getProjects(@Param("domainId") domainId: string): Promise<Project[]> {
    const projects = await this.projects.getProjects(domainId);
    return projects.map((project) =>
      omit(project as ProjectWithIssues, ["issues"]),
    );
  }

  @Post(":domainId/projects")
  async createProject(
    @Param("domainId") domainId: string,
    @Body() body: CreateProjectBody,
  ) {
    return this.projects.addProject({
      domainId,
      ...body,
      labels: [],
      components: [],
      issueTypes: [],
      resolutions: [],
    });
  }

  @Get(":domainId/sources")
  async getDataSources(
    @Param("domainId") domainId: string,
    @Query("query") query: string,
  ) {
    const domain = await this.domains.getDomain(domainId);
    return this.dataSources.getDataSources({ domain, query });
  }
}

const normaliseHost = (host: string): string => {
  if (host.startsWith("https://") || host.startsWith("http://")) {
    const url = new URL(host);
    return url.host;
  }

  return host;
};

const domainToResponse = ({ id, host, email, token }: Domain) => {
  const tokenSuffix = token.substring(token.length - 3, token.length);
  return {
    id,
    host,
    credentials: `${email} (***${tokenSuffix})`,
  };
};

type ProjectWithIssues = Project & {
  issues: Issue[];
};
