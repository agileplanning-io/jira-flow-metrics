import { createContext } from "react";
import { Project } from "@data/projects";
import { CycleTimePolicy, Issue } from "@agileplanning-io/flow-metrics";
import { CurrentPolicy } from "@agileplanning-io/flow-components";

export type ProjectContextType = {
  project?: Project;
  currentPolicy?: CurrentPolicy;
  selectCycleTimePolicy: (id?: string, name?: string) => void;
  updateCurrentPolicy: (policy: CycleTimePolicy) => void;
  issues?: Issue[];
};

export const ProjectContext = createContext<ProjectContextType>({
  updateCurrentPolicy: () => {},
  selectCycleTimePolicy: () => {},
});
