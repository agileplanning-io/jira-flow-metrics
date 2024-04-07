import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import { Injectable } from "@nestjs/common";
import { JiraIssuesRepository } from "./jira-issues-repository";
import {
  JiraIssueBuilder,
  StatusBuilder,
} from "@agileplanning-io/flow-metrics";
import { DomainsRepository } from "@entities/domains";
import { flatten, uniq } from "rambda";
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

    const labels = uniq(flatten<string>(issues.map((issue) => issue.labels)));
    const issueTypes = uniq(
      flatten<string>(issues.map((issue) => issue.issueType)),
    );
    const components = uniq(
      flatten<string>(issues.map((issue) => issue.components)),
    );

    await this.projects.updateProject(projectId, {
      lastSync: {
        date: new Date(),
        issueCount: issues.length,
      },
      components,
      labels,
      issueTypes,
      workflowScheme: workflowScheme,
      defaultCycleTimePolicy,
    });

    return issues;
  }
}
