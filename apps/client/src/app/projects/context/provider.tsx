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

          if (isNonNullish(cachedPolicy)) {
            const isChanged = !isPolicyEqual(
              currentPolicy.policy,
              cachedPolicy.policy,
            );

            // We just saved the policy
            if (currentPolicy.isChanged && !isChanged) {
              setCurrentPolicy({ ...currentPolicy, isChanged: false });
            }

            // We just made the policy the default
            if (!currentPolicy.isDefault && cachedPolicy.isDefault) {
              setCurrentPolicy({ ...currentPolicy, isDefault: true });
            }
          }
        }
      } else {
        // loading the page, figure out which policy to use
        if (currentPolicyId) {
          const policy = savedPolicies.find(
            (policy) => policy.id === currentPolicyId,
          );
          if (policy) {
            setCurrentPolicy({ ...policy, isChanged: false });
          } else {
            setCurrentPolicyId();
          }
        } else {
          const defaultPolicy = savedPolicies.find(
            (policy) => policy.isDefault,
          );

          if (defaultPolicy) {
            setCurrentPolicyId(defaultPolicy.id);
            setCurrentPolicy({ ...defaultPolicy, isChanged: false });
          } else {
            setCurrentPolicy({
              name: "Custom",
              policy: project.defaultCycleTimePolicy,
              isDefault: false,
              isChanged: false,
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
        const isChanged = !isDeepEqual(currentPolicy.policy, policy);
        setCurrentPolicy({ ...currentPolicy, policy, isChanged });
      }
    },
    [currentPolicy, setCurrentPolicy],
  );

  const selectCycleTimePolicy = useCallback(
    (policyId?: string, name?: string) => {
      console.info("selectCycleTimePolicy", { policyId, name });
      const policy = savedPolicies?.find((policy) => policy.id === policyId);
      console.info("savedPolicy", policy);
      setCurrentPolicyId(policyId, policy?.name ?? name);
      if (policy) {
        setCurrentPolicy({ ...policy, isChanged: false });
      } else {
        setCurrentPolicy(undefined);
        // setCurrentPolicyId(undefined, "Custom");
        // const prevPolicy = currentPolicy?.policy;
        // if (prevPolicy) {
        //   setCurrentPolicy({
        //     policy: prevPolicy,
        //     name: "Custom",
        //     isDefault: false,
        //     isChanged: false,
        //   });
        // }
      }
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
