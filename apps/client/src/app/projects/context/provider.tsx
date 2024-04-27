import { useNavigationContext } from "../../navigation/context";
import { ProjectContext, ProjectContextType } from "./context";
import { useIssues } from "@data/issues";
import { CycleTimePolicy } from "@agileplanning-io/flow-metrics";
import { useEffect } from "react";
import { useQueryState } from "@lib/use-query-state";
import { cycleTimePolicySchema } from "./schema";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const [cycleTimePolicy, setCycleTimePolicy] = useQueryState<
    CycleTimePolicy | undefined
  >("p", cycleTimePolicySchema.parse);

  const { data: issues } = useIssues(project?.id, cycleTimePolicy);

  useEffect(() => {
    if (!project) {
      return;
    }

    if (!cycleTimePolicy) {
      setCycleTimePolicy(project.defaultCycleTimePolicy);
    }
  }, [project, cycleTimePolicy, setCycleTimePolicy]);

  const value: ProjectContextType = {
    project,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
