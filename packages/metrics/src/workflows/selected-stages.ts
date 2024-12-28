import { StatusCycleTimePolicy } from "../metrics";
import { Workflow } from "./types";

/**
 * Returns the stages in a workflow for the given StatusCycleTimePolicy. This is helpful for
 * displaying the selected stages for a given policy.
 */
export const getSelectedStages = (
  workflow: Workflow,
  policy?: StatusCycleTimePolicy,
) => {
  return workflow.stages
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          policy?.statuses?.some(
            (projectStatus) => projectStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);
};
