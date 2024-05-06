import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import { Injectable } from "@nestjs/common";
import { JiraIssuesRepository } from "./jira-issues-repository";
import {
  FilterType,
  IssueFilter,
  JiraIssueBuilder,
  StatusBuilder,
} from "@agileplanning-io/flow-metrics";
import { DomainsRepository } from "@entities/domains";
import { filter, flat, isNonNullish, unique } from "remeda";
import { buildDefaultWorkflowScheme } from "./build-default-workflow";
import { isValidWorkflowScheme } from "./validation-rules";
import { buildDefaultCycleTimePolicy } from "./build-default-policy";

@Injectable()
export class SyncUseCase {
  constructor(
    private readonly projects: ProjectsRepository,
    private readonly issues: IssuesRepository,
    private readonly domains: DomainsRepository,
    private readonly jiraIssues: JiraIssuesRepository,
  ) {}

  async exec(projectId: string) {
    const project = await this.projects.getProject(projectId);
    const domain = await this.domains.getDomain(project.domainId);

    const [fields, jiraStatuses] = await Promise.all([
      this.jiraIssues.getFields(domain),
      this.jiraIssues.getStatuses(domain),
    ]);

    const statusBuilder = new StatusBuilder(jiraStatuses);

    const builder = new JiraIssueBuilder(fields, statusBuilder, domain.host);

    const issues = await this.jiraIssues.search(domain, {
      jql: project.jql,
      onProgress: () => {},
      builder,
    });

    await this.issues.setIssues(projectId, issues);

    const canonicalStatuses = statusBuilder.getStatuses();

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

    const defaultFilter = buildDefaultFilter(resolutions);

    await this.projects.updateProject(projectId, {
      lastSync: {
        date: new Date(),
        issueCount: issues.length,
      },
      components,
      labels,
      resolutions,
      issueTypes,
      workflowScheme: workflowScheme,
      defaultCycleTimePolicy,
      defaultFilter,
    });

    return issues;
  }
}

const buildDefaultFilter = (resolutions: string[]): IssueFilter => {
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
