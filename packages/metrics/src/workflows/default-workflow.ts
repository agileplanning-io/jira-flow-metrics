import {
  HierarchyLevel,
  Issue,
  StatusCategory,
  TransitionStatus,
} from "../issues";
import { sortStatuses } from "./sort-statuses";
import { WorkflowScheme, WorkflowStage } from "./types";
import { compact } from "remeda";

export const buildDefaultWorkflowScheme = (
  issues: Issue[],
  canonicalStatuses: TransitionStatus[],
): WorkflowScheme => {
  const statuses = buildProjectStatuses(issues, canonicalStatuses);

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

const buildProjectStatuses = (
  issues: Issue[],
  canonicalStatuses: TransitionStatus[],
): {
  stories: TransitionStatus[];
  epics: TransitionStatus[];
} => {
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
    stories: compact(storyStatuses),
    epics: compact(epicStatuses),
  };
};
