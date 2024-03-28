import {
  ProjectsRepository,
  WorkflowStage,
  Workflow,
  ProjectStatuses,
} from "@entities/projects";
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
import { Issue } from "@agileplanning-io/flow-metrics";

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

    const statuses = buildProjectStatuses(issues, canonicalStatuses);

    const workflow = buildWorkflow(project.workflow, statuses);

    const defaultCycleTimePolicy = buildDefaultCycleTimePolicy(
      project.defaultCycleTimePolicy,
      workflow,
      statuses,
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
      statuses,
      components,
      labels,
      workflow,
      defaultCycleTimePolicy,
    });

    return issues;
  }
}

const buildWorkflow = (
  currentWorkflow: Workflow | undefined,
  statuses: ProjectStatuses,
): Workflow => {
  if (currentWorkflow && isValidWorkflow(currentWorkflow, statuses)) {
    return currentWorkflow;
  }

  const getWorkflowStage =
    (statuses: TransitionStatus[]) =>
    (category: StatusCategory): WorkflowStage => ({
      name: category,
      selectByDefault: category === StatusCategory.InProgress,
      statuses: statuses.filter((status) => status.category === category),
    });

  const categories = [
    StatusCategory.ToDo,
    StatusCategory.InProgress,
    StatusCategory.Done,
  ];

  const workflow: Workflow = {
    stories: {
      stages: categories.map(getWorkflowStage(statuses.stories)),
    },
    epics: {
      stages: categories.map(getWorkflowStage(statuses.epics)),
    },
  };

  return workflow;
};

const buildDefaultCycleTimePolicy = (
  currentCycleTimePolicy: CycleTimePolicy | undefined,
  workflow: Workflow,
  statuses: ProjectStatuses,
): CycleTimePolicy => {
  if (
    currentCycleTimePolicy &&
    isValidCycleTimePolicy(currentCycleTimePolicy, statuses)
  ) {
    return currentCycleTimePolicy;
  }

  const defaultSelectedStages = workflow.stories.stages.filter(
    (stage) => stage.selectByDefault,
  );

  const storyStatuses = statusesInWorkflowStages(defaultSelectedStages);

  return {
    stories: {
      type: "status",
      includeWaitTime: false,
      statuses: storyStatuses,
    },
    epics: {
      type: "computed",
    },
  };
};

const statusesInWorkflowStages = (stages: WorkflowStage[]): string[] =>
  flatten(stages.map((stage) => stage.statuses.map((status) => status.name)));

const isValidWorkflow = (
  workflow: Workflow,
  statuses: ProjectStatuses,
): boolean => {
  return (
    statusesInWorkflowStages(workflow.stories.stages).every(
      isValidStatus(statuses.stories),
    ) &&
    statusesInWorkflowStages(workflow.epics.stages).every(
      isValidStatus(statuses.epics),
    )
  );
};

const isValidCycleTimePolicy = (
  policy: CycleTimePolicy,
  statuses: ProjectStatuses,
): boolean => {
  const validStoryPolicy = policy.stories.statuses.every(
    isValidStatus(statuses.stories),
  );
  const validEpicPolicy =
    (policy.epics.type === "status" &&
      policy.epics.statuses.every(isValidStatus(statuses.epics))) ||
    policy.epics.type === "computed";

  return validStoryPolicy && validEpicPolicy;
};

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);

const buildProjectStatuses = (
  issues: Issue[],
  canonicalStatuses: TransitionStatus[],
): ProjectStatuses => {
  const stories = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Story,
  );
  const epics = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
  );

  const storyStatuses = sortStatuses(stories).map((name) =>
    canonicalStatuses.find((status) => status.name === name),
  );
  const epicStatuses = sortStatuses(epics).map((name) =>
    canonicalStatuses.find((status) => status.name === name),
  );

  return {
    stories: storyStatuses,
    epics: epicStatuses,
  };
};
