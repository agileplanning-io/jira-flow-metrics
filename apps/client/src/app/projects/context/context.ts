import { createContext } from "react";
import { Project } from "@data/projects";
import {
  CycleTimePolicy,
  Issue,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";

export type ProjectContextType = {
  project?: Project;
  cycleTimePolicy?: CycleTimePolicy;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
  issues?: Issue[];
};

export const ProjectContext = createContext<ProjectContextType>({
  setCycleTimePolicy: () => {},
  cycleTimePolicy: {
    stories: {
      type: "status",
      includeWaitTime: false,
    },
    epics: {
      type: "computed",
      labelsFilter: {
        labelFilterType: LabelFilterType.Include,
      },
    },
  },
});
