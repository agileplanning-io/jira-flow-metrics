import { useNavigationContext } from "../../navigation/context";
import { ProjectContext, ProjectContextType } from "./context";
import { useIssues } from "@data/issues";
import {
  CycleTimePolicy,
  cycleTimePolicySchema,
} from "@agileplanning-io/flow-metrics";
import { useEffect, useState } from "react";
import { useQueryState } from "@lib/use-query-state";
import { useGetPolicies } from "@data/projects";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const [cycleTimePolicy, setCycleTimePolicy] = useQueryState<
    CycleTimePolicy | undefined
  >("p", cycleTimePolicySchema.optional().parse);

  const { data: issues } = useIssues(project?.id, cycleTimePolicy);

  const { data: savedPolicies } = useGetPolicies(project?.id);

  const [savedPolicyId, setSavedPolicyId] = useState<string>();

  useEffect(() => {
    if (!project) {
      return;
    }

    if (savedPolicies && !savedPolicyId) {
      const defaultPolicy = savedPolicies.find((policy) => policy.isDefault);
      if (defaultPolicy) {
        setSavedPolicyId(defaultPolicy.id);
        setCycleTimePolicy(defaultPolicy.policy);
      } else if (!cycleTimePolicy) {
        setCycleTimePolicy(project.defaultCycleTimePolicy);
      }
    }
  }, [
    project,
    cycleTimePolicy,
    setCycleTimePolicy,
    savedPolicies,
    savedPolicyId,
  ]);

  const value: ProjectContextType = {
    project,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy,
    savedPolicyId,
    setSavedPolicyId,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
