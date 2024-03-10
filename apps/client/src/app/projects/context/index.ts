import { useContext } from "react";
import { ProjectContext, ProjectContextType } from "./context";

export const useProjectContext = (): ProjectContextType => {
  return useContext(ProjectContext);
};
