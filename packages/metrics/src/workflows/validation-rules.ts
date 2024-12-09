import { TransitionStatus } from "../issues";
import { CycleTimePolicy, EpicCycleTimePolicyType } from "../metrics";
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
  const validStoryPolicy = policy.statuses.every(
    isValidStatus(scheme.stories.statuses),
  );

  const validEpicPolicy =
    policy.epics.type === EpicCycleTimePolicyType.EpicStatus &&
    policy.epics.statuses.every(isValidStatus(scheme.epics.statuses));

  return validStoryPolicy && validEpicPolicy;
};

const isValidStatus = (validStatuses: TransitionStatus[]) => (status: string) =>
  validStatuses.map((status) => status.name).includes(status);
