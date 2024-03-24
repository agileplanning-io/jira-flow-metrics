import { createContext } from "react";
import { Project } from "@data/projects";
import {
  CycleTimePolicy,
  Issue,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";

export type ComputedCycleTimePolicy = {
  labelFilterType: LabelFilterType;
  labels?: string[];
  includeWaitTime: boolean;
  statuses?: string[];
};

export const toCycleTimePolicy = (
  policy: ComputedCycleTimePolicy,
): CycleTimePolicy => ({
  stories: {
    type: "status",
    statuses: policy.statuses,
    includeWaitTime: policy.includeWaitTime,
  },
  epics: {
    type: "computed",
    labelsFilter: {
      labelFilterType: policy.labelFilterType,
      labels: policy.labels,
    },
  },
});

export const fromCycleTimePolicy = (
  policy: CycleTimePolicy,
): ComputedCycleTimePolicy => {
  if (policy.epics.type !== "computed") {
    throw new Error(`Expected 'status' policy`);
  }
  return {
    statuses: policy.stories.statuses,
    includeWaitTime: policy.stories.includeWaitTime,
    labelFilterType:
      policy.epics.labelsFilter?.labelFilterType ?? LabelFilterType.Include,
    labels: policy.epics.labelsFilter?.labels,
  };
};

export type ProjectContextType = {
  project?: Project;
  cycleTimePolicy: ComputedCycleTimePolicy;
  setCycleTimePolicy: (policy: ComputedCycleTimePolicy) => void;
  issues?: Issue[];
};

export const ProjectContext = createContext<ProjectContextType>({
  setCycleTimePolicy: () => {},
  cycleTimePolicy: {
    labelFilterType: LabelFilterType.Include,
    includeWaitTime: false,
  },
});
