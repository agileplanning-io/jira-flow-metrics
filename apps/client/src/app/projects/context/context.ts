import { createContext } from "react";
import { Project } from "@data/projects";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  Issue,
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
    type: CycleTimePolicyType.LeadTime,
    statuses: [],
    epics: {
      type: EpicCycleTimePolicyType.EpicStatus,
      statuses: [],
    },
  },
});
