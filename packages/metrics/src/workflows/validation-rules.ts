import { TransitionStatus } from "../issues";
import { CycleTimePolicy } from "../metrics";
import { WorkflowScheme, Workflow, statusesInWorkflowStages } from "./types";

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
    (policy.stories.type === "status" &&
      policy.stories.statuses?.every(isValidStatus(scheme.stories.statuses))) ??
    true;

  const validEpicPolicy =
    (policy.epics.type === "status" &&
      policy.epics.statuses?.every(isValidStatus(scheme.epics.statuses))) ??
    true;

  return validStoryPolicy && validEpicPolicy;
};

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);
