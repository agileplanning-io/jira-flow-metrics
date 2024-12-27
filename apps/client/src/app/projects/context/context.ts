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
  savedPolicyId?: string;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
  setSavedPolicyId: (policyId?: string) => void;
  issues?: Issue[];
};

export const ProjectContext = createContext<ProjectContextType>({
  setCycleTimePolicy: () => {},
  setSavedPolicyId: () => {},
  cycleTimePolicy: {
    type: CycleTimePolicyType.LeadTime,
    statuses: [],
    epics: {
      type: EpicCycleTimePolicyType.EpicStatus,
      statuses: [],
    },
  },
});
