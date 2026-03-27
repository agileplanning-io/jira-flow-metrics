import { ProjectsRepository } from "@entities/projects";
import { Injectable } from "@nestjs/common";
import {
  FilterType,
  IssueFilter,
  buildDefaultWorkflowScheme,
  isValidWorkflowScheme,
  buildDefaultCycleTimePolicy,
} from "@agileplanning-io/flow-metrics";
import { DomainsRepository } from "@entities/domains";
import { filter, flat, isNonNullish, unique } from "remeda";
import { SearchIssuesRepository } from "./jira-issues-repository";
import { IssuesRepository } from "@entities/issues";

@Injectable()
export class SyncUseCase {
  constructor(
    private readonly projects: ProjectsRepository,
    private readonly issues: IssuesRepository,
    private readonly domains: DomainsRepository,
    private readonly searchIssues: SearchIssuesRepository,
  ) {}

  async exec(projectId: string) {
    const project = await this.projects.getProject(projectId);
    const domain = await this.domains.getDomain(project.domainId);

    const { issues, canonicalStatuses } = await this.searchIssues.search(
      domain,
      project.query,
    );

    await this.issues.setIssues(projectId, issues);

    const workflowScheme =
      project.workflowScheme && isValidWorkflowScheme(project.workflowScheme)
        ? project.workflowScheme
        : buildDefaultWorkflowScheme(issues, canonicalStatuses);

    const defaultCycleTimePolicy = buildDefaultCycleTimePolicy(
      project.defaultCycleTimePolicy,
      workflowScheme,
    );

    const uniqueValues = (
      values: (string | undefined)[][] | (string | undefined)[],
    ) => unique(filter(flat(values), isNonNullish));

    const labels = uniqueValues(issues.map((issue) => issue.labels));
    const issueTypes = uniqueValues(issues.map((issue) => issue.issueType));
    const components = uniqueValues(issues.map((issue) => issue.components));
    const resolutions = uniqueValues(issues.map((issue) => issue.resolution));

    const defaultCompletedFilter =
      project.defaultCompletedFilter ??
      buildDefaultCompletedFilter(resolutions);

    await this.projects.updateProject(projectId, {
      lastSync: {
        date: new Date(),
        issueCount: issues.length,
      },
      components,
      labels,
      resolutions,
      issueTypes,
      workflowScheme,
      defaultCycleTimePolicy,
      defaultCompletedFilter,
    });

    return issues;
  }
}

const buildDefaultCompletedFilter = (resolutions: string[]): IssueFilter => {
  if (!resolutions.includes("Done")) {
    return {};
  }

  return {
    resolutions: {
      type: FilterType.Include,
      values: ["Done"],
    },
  };
};
