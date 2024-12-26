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
import { isDeepEqual } from "remeda";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const [cycleTimePolicy, setCycleTimePolicy] = useQueryState<
    CycleTimePolicy | undefined
  >("p", cycleTimePolicySchema.optional().parse);

  console.info("ProjectProvider", cycleTimePolicy, project);

  const { data: issues } = useIssues(project?.id, cycleTimePolicy);

  const { data: savedPolicies } = useGetPolicies(project?.id);

  const [savedPolicyId, setSavedPolicyId] = useState<string>();

  useEffect(() => {
    if (!project) {
      return;
    }

    console.info("provider useEffect", {
      cycleTimePolicy,
      savedPolicyId,
      savedPolicies,
    });

    if (savedPolicies) {
      console.info("provider", {
        savedPolicies,
        savedPolicyId,
        cycleTimePolicy,
      });

      if (!cycleTimePolicy) {
        if (savedPolicyId) {
          const savedPolicy = savedPolicies.find(
            (policy) => policy.id === savedPolicyId,
          );
          if (savedPolicy) {
            setCycleTimePolicy(savedPolicy.policy);
          }
        } else {
          const defaultPolicy = savedPolicies.find(
            (policy) => policy.isDefault,
          );
          if (defaultPolicy) {
            setSavedPolicyId(defaultPolicy.id);
            console.info("setCycleTimePolicy 1");
            setCycleTimePolicy(defaultPolicy.policy);
          } else if (!cycleTimePolicy) {
            console.info("setCycleTimePolicy 2");
            setCycleTimePolicy(project.defaultCycleTimePolicy);
          }
        }
      } else {
        // cycle time policy specified by parameters, so we should respect those
        const foundPolicy = savedPolicies.find((policy) =>
          isDeepEqual(policy.policy, cycleTimePolicy),
        );
        if (foundPolicy) {
          setSavedPolicyId(foundPolicy.id);
        }
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
