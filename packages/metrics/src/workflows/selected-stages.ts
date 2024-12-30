import { Workflow } from "./types";

/**
 * Returns the stages in a workflow for the given statuses. This is helpful for
 * displaying the selected stages for a given policy.
 */
export const getSelectedStages = (workflow: Workflow, statuses?: string[]) => {
  return workflow.stages
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          statuses?.some((projectStatus) => projectStatus === status.name),
      ),
    )
    .map((stage) => stage.name);
};
