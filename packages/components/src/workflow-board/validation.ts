import { WorkflowStage } from "@agileplanning-io/flow-metrics";
import { unique } from "remeda";

export const validateWorkflow = (workflowStages: WorkflowStage[]) => {
  const errors: string[] = [];

  const normaliseName = (stage: WorkflowStage) =>
    stage.name.trim().toLocaleLowerCase();

  workflowStages?.forEach((stage) => {
    if (normaliseName(stage).length === 0) {
      errors.push("All stages must have a name");
    } else {
      const duplicateNames =
        workflowStages.filter(
          (otherStage) => normaliseName(otherStage) === normaliseName(stage),
        ).length > 1;

      if (duplicateNames) {
        errors.push(
          `Duplicate stage name '${stage.name}' found. Rename a stage or remove it.`,
        );
      }

      if (stage.statuses.length === 0) {
        errors.push(
          `Stage '${stage.name}' cannot be empty. Add a status or remove it.`,
        );
      }
    }
  });

  return errors.length > 0 ? unique(errors) : undefined;
};
