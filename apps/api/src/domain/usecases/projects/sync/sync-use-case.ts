import {
  ProjectsRepository,
  WorkflowStage,
  Workflow,
  WorkflowScheme,
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

    // TODO: this shouldn't typecheck since project.workflow may be undefined
    const workflowScheme =
      project.workflowScheme && isValidWorkflowScheme(project.workflowScheme)
        ? project.workflowScheme
        : buildDefaultWorkflowScheme(statuses);

    const defaultCycleTimePolicy = buildDefaultCycleTimePolicy(
      project.defaultCycleTimePolicy,
      workflowScheme,
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
      components,
      labels,
      workflowScheme: workflowScheme,
      defaultCycleTimePolicy,
    });

    return issues;
  }
}

type ProjectStatuses = {
  stories: TransitionStatus[];
  epics: TransitionStatus[];
};

const buildDefaultWorkflowScheme = (
  statuses: ProjectStatuses,
): WorkflowScheme => {
  const buildWorkflowStage =
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

  const buildWorkflow = (statuses: TransitionStatus[]) => ({
    statuses,
    stages: categories.map(buildWorkflowStage(statuses)),
  });

  const workflowScheme: WorkflowScheme = {
    stories: buildWorkflow(statuses.stories),
    epics: buildWorkflow(statuses.epics),
  };

  return workflowScheme;
};

const buildDefaultCycleTimePolicy = (
  currentCycleTimePolicy: CycleTimePolicy | undefined,
  scheme: WorkflowScheme,
): CycleTimePolicy => {
  if (
    currentCycleTimePolicy &&
    isValidCycleTimePolicy(currentCycleTimePolicy, scheme)
  ) {
    return currentCycleTimePolicy;
  }

  const getDefaultWorkflowStatuses = (workflow: Workflow) => {
    const defaultStages = workflow.stages.filter(
      (stage) => stage.selectByDefault,
    );
    return statusesInWorkflowStages(defaultStages);
  };

  return {
    stories: {
      type: "status",
      includeWaitTime: false,
      statuses: getDefaultWorkflowStatuses(scheme.stories),
    },
    epics: {
      type: "status",
      includeWaitTime: false,
      statuses: getDefaultWorkflowStatuses(scheme.epics),
    },
  };
};

const statusesInWorkflowStages = (stages: WorkflowStage[]): string[] =>
  flatten(stages.map((stage) => stage.statuses.map((status) => status.name)));

const isValidWorkflowScheme = (scheme: WorkflowScheme): boolean => {
  return isValidWorkflow(scheme.stories) && isValidWorkflow(scheme.epics);
};

const isValidWorkflow = (workflow: Workflow): boolean => {
  return statusesInWorkflowStages(workflow.stages).every(
    isValidStatus(workflow.statuses),
  );
};

const isValidCycleTimePolicy = (
  policy: CycleTimePolicy,
  scheme: WorkflowScheme,
): boolean => {
  const validStoryPolicy = policy.stories.statuses.every(
    isValidStatus(scheme.stories.statuses),
  );
  const validEpicPolicy =
    (policy.epics.type === "status" &&
      policy.epics.statuses.every(isValidStatus(scheme.epics.statuses))) ||
    policy.epics.type === "computed";

  return validStoryPolicy && validEpicPolicy;
};

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);

const buildProjectStatuses = (
  issues: Issue[],
  canonicalStatuses: TransitionStatus[],
) => {
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
