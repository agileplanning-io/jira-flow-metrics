import { CycleTimePolicy } from "../metrics";
import { WorkflowScheme, Workflow, statusesInWorkflowStages } from "./types";
import { isValidCycleTimePolicy } from "./validation-rules";

export const buildDefaultCycleTimePolicy = (
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
