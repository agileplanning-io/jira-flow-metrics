import { useNavigationContext } from "../../navigation/context";
import { ProjectContext, ProjectContextType } from "./context";
import { useIssues } from "@data/issues";
import {
  CycleTimePolicy,
  getFlowMetrics,
  isPolicyEqual,
  SavedPolicy,
} from "@agileplanning-io/flow-metrics";
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

  const { data: issues } = useIssues(project?.id);

  const metricIssues =
    issues && currentPolicy
      ? getFlowMetrics(issues, currentPolicy.policy)
      : undefined;

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
            (policy) => policy.id === currentPolicyId,
          );

          if (isNonNullish(cachedPolicy)) {
            if (currentPolicy.id !== currentPolicyId) {
              setCurrentPolicy({ ...cachedPolicy, isChanged: false });
            } else {
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
        } else if (currentPolicyId) {
          // We just saved a new policy, so we need to update the current policy
          const cachedPolicy = savedPolicies.find(
            (policy) => policy.id === currentPolicyId,
          );

          if (isNonNullish(cachedPolicy)) {
            setCurrentPolicy({ ...cachedPolicy, isChanged: false });
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
            setCurrentPolicyId(defaultPolicy);
            setCurrentPolicy({ ...defaultPolicy, isChanged: false });
          } else {
            setCurrentPolicy({
              name: "Unsaved",
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
    (policyId?: string, savedPolicy?: SavedPolicy) => {
      if (policyId) {
        const selectedPolicy =
          savedPolicy ??
          savedPolicies?.find((policy) => policy.id === policyId);

        if (selectedPolicy) {
          setCurrentPolicyId(selectedPolicy);
          setCurrentPolicy({ ...selectedPolicy, isChanged: false });
        }
      } else {
        // We've just deleted a saved policy. We'll keep the same policy but as a custom (unsaved) policy.
        setCurrentPolicyId();
        const prevPolicy = currentPolicy?.policy;
        if (prevPolicy) {
          setCurrentPolicy({
            policy: prevPolicy,
            name: "Unsaved",
            isDefault: false,
            isChanged: false,
          });
        }
      }
    },
    [savedPolicies, setCurrentPolicyId, currentPolicy],
  );

  const value: ProjectContextType = useMemo(
    () => ({
      project,
      issues: metricIssues,
      currentPolicy,
      updateCurrentPolicy,
      selectCycleTimePolicy,
    }),
    [
      project,
      metricIssues,
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
      const parts = param.split(".");
      return parts[parts.length - 1];
    }
  }, [params]);

  type CurrentPolicyParams = {
    id: string;
    name: string;
  };

  const setCurrentPolicyId = useCallback(
    (params?: CurrentPolicyParams) =>
      setParams((prev) => {
        if (params) {
          prev.set(policyKey, `${params.name}.${params.id}`);
        } else {
          prev.delete(policyKey);
        }
        return prev;
      }),
    [setParams],
  );

  return { currentPolicyId, setCurrentPolicyId };
};
