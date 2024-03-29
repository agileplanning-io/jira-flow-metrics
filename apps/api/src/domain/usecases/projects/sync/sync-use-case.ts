import { ProjectsRepository, WorkflowStage } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import { Injectable } from "@nestjs/common";
import { JiraIssuesRepository } from "./jira-issues-repository";
import {
  JiraIssueBuilder,
  StatusBuilder,
  HierarchyLevel,
  StatusCategory,
  CycleTimePolicy,
} from "@agileplanning-io/flow-metrics";
import { DomainsRepository } from "@entities/domains";
import { sortStatuses } from "./sort-statuses";
import { TransitionStatus } from "@agileplanning-io/flow-metrics";
import { flatten, uniq } from "rambda";

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

    const stories = issues.filter(
      (issue) => issue.hierarchyLevel === HierarchyLevel.Story,
    );
    const canonicalStatuses = statusBuilder.getStatuses();

    const sortedStatuses = sortStatuses(stories).map((name) =>
      canonicalStatuses.find((status) => status.name === name),
    );

    const workflow = buildWorkflow(project.workflow, sortedStatuses);
    const defaultCycleTimePolicy = buildDefaultCycleTimePolicy(
      project.defaultCycleTimePolicy,
      workflow,
      sortedStatuses,
    );

    const labels = uniq(flatten<string>(issues.map((issue) => issue.labels)));
    const components = uniq(
      flatten<string>(issues.map((issue) => issue.components)),
    );

    await this.projects.updateProject(projectId, {
      lastSync: {
        date: new Date(),
        issueCount: issues.length,
      },
      statuses: sortedStatuses,
      components,
      labels,
      workflow,
      defaultCycleTimePolicy,
    });

    return issues;
  }
}

const buildWorkflow = (
  currentWorkflow: WorkflowStage[] | undefined,
  sortedStatuses: TransitionStatus[],
): WorkflowStage[] => {
  if (
    currentWorkflow &&
    statusesInWorkflow(currentWorkflow).every(isValidStatus(sortedStatuses))
  ) {
    return currentWorkflow;
  }

  const getWorkflowStage = (category: StatusCategory): WorkflowStage => ({
    name: category,
    selectByDefault: category === StatusCategory.InProgress,
    statuses: sortedStatuses.filter((status) => status.category === category),
  });

  const workflow = [
    StatusCategory.ToDo,
    StatusCategory.InProgress,
    StatusCategory.Done,
  ].map(getWorkflowStage);

  return workflow;
};

const buildDefaultCycleTimePolicy = (
  currentCycleTimePolicy: CycleTimePolicy | undefined,
  workflow: WorkflowStage[],
  sortedStatuses: TransitionStatus[],
): CycleTimePolicy => {
  if (
    currentCycleTimePolicy &&
    currentCycleTimePolicy.stories.statuses.every(isValidStatus(sortedStatuses))
  ) {
    return currentCycleTimePolicy;
  }

  const defaultSelectedStages = workflow.filter(
    (stage) => stage.selectByDefault,
  );

  const statuses = statusesInWorkflow(defaultSelectedStages);

  return {
    stories: {
      type: "status",
      includeWaitTime: false,
      statuses,
    },
    epics: {
      type: "computed",
    },
  };
};

const statusesInWorkflow = (workflow: WorkflowStage[]): string[] =>
  flatten(workflow.map((stage) => stage.statuses.map((status) => status.name)));

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);
