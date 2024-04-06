import { StatusCycleTimePolicy } from "@agileplanning-io/flow-metrics";
import { Workflow } from "@data/projects";

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
