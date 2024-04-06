import {
  CycleTimePolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import {
  Workflow,
  WorkflowScheme,
  statusesInWorkflowStages,
} from "@entities/projects";

export const isValidWorkflowScheme = (scheme: WorkflowScheme): boolean => {
  return isValidWorkflow(scheme.stories) && isValidWorkflow(scheme.epics);
};

const isValidWorkflow = (workflow: Workflow): boolean => {
  return statusesInWorkflowStages(workflow.stages).every(
    isValidStatus(workflow.statuses),
  );
};

export const isValidCycleTimePolicy = (
  policy: CycleTimePolicy,
  scheme: WorkflowScheme,
): boolean => {
  const validStoryPolicy =
    policy.stories.statuses?.every(isValidStatus(scheme.stories.statuses)) ??
    false;

  const validEpicPolicy =
    (policy.epics.type === "status" &&
      policy.epics.statuses?.every(isValidStatus(scheme.epics.statuses))) ||
    policy.epics.type === "computed";

  return validStoryPolicy && validEpicPolicy;
};

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);
