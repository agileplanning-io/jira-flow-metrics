import { useNavigationContext } from "../../navigation/context";
import { ProjectContext, ProjectContextType } from "./context";
import { useIssues } from "@data/issues";
import { CycleTimePolicy, isPolicyEqual } from "@agileplanning-io/flow-metrics";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useGetPolicies } from "@data/projects";
import { isDeepEqual, isNonNullish } from "remeda";
import { useSearchParams } from "react-router-dom";
import {
  CurrentPolicy,
  isSavedPolicy,
} from "@agileplanning-io/flow-components";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const { currentPolicyId, setCurrentPolicyId } = useCurrentPolicyId();
  const [currentPolicy, setCurrentPolicy] = useState<CurrentPolicy>();

  const { data: issues } = useIssues(project?.id, currentPolicy?.policy);

  const { data: savedPolicies } = useGetPolicies(project?.id);

  console.info("provider", { currentPolicyId, currentPolicy });

  useEffect(() => {
    if (!project) {
      return;
    }

    if (savedPolicies) {
      if (currentPolicy) {
        // check the policy is up to date, e.g. if we just saved it
        if (isSavedPolicy(currentPolicy)) {
          const cachedPolicy = savedPolicies.find(
            (policy) => policy.id === currentPolicy.id,
          );
          const changed =
            isNonNullish(cachedPolicy) &&
            !isPolicyEqual(currentPolicy.policy, cachedPolicy.policy);
          if (currentPolicy.changed !== changed) {
            setCurrentPolicy({ ...currentPolicy, changed });
          }
        }
      } else {
        // loading the page, figure out which policy to use
        if (!currentPolicyId) {
          const defaultPolicy = savedPolicies.find(
            (policy) => policy.isDefault,
          );

          if (defaultPolicy) {
            setCurrentPolicyId(defaultPolicy.id);
            setCurrentPolicy({ ...defaultPolicy, changed: false });
          } else {
            setCurrentPolicy({
              name: "Custom",
              policy: project.defaultCycleTimePolicy,
              isDefault: false,
              changed: false,
            });
          }
        }
      }
    }
  }, [
    currentPolicy,
    currentPolicyId,
    setCurrentPolicy,
    setCurrentPolicyId,
    project,
    savedPolicies,
  ]);

  const updateCurrentPolicy = useCallback(
    (policy: CycleTimePolicy) => {
      if (currentPolicy) {
        const changed = !isDeepEqual(currentPolicy.policy, policy);
        setCurrentPolicy({ ...currentPolicy, policy, changed });
      }
    },
    [currentPolicy, setCurrentPolicy],
  );

  const selectCycleTimePolicy = useCallback(
    (policyId?: string, name?: string) => {
      const policy = savedPolicies?.find((policy) => policy.id === policyId);
      setCurrentPolicyId(policyId, policy?.name ?? name);
      if (policy) {
        setCurrentPolicy({ ...policy, changed: false });
      }
      // TODO: does this work when deleting a policy?
    },
    [savedPolicies, setCurrentPolicyId],
  );

  const value: ProjectContextType = useMemo(
    () => ({
      project,
      issues,
      currentPolicy,
      updateCurrentPolicy,
      selectCycleTimePolicy,
    }),
    [
      project,
      issues,
      currentPolicy,
      updateCurrentPolicy,
      selectCycleTimePolicy,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

const policyKey = "policy";

const useCurrentPolicyId = () => {
  const [params, setParams] = useSearchParams();

  const currentPolicyId = useMemo(() => {
    const param = params.get(policyKey);
    if (param?.trim().length) {
      const parts = param.split("-");
      return parts[parts.length - 1];
    }
  }, [params]);

  const setCurrentPolicyId = useCallback(
    (id?: string, name?: string) =>
      setParams((prev) => {
        if (id?.trim().length) {
          prev.set(policyKey, `${name}-${id}`);
        } else {
          prev.delete(policyKey);
        }
        return prev;
      }),
    [setParams],
  );

  return { currentPolicyId, setCurrentPolicyId };
};
