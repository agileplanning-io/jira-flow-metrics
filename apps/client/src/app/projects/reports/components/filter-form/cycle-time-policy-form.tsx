import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import {
  Project,
  useCreatePolicy,
  useDeletePolicy,
  useGetPolicies,
  useSetDefaultPolicy,
  useUpdatePolicy,
} from "@data/projects";
import { FC } from "react";

type CycleTimePolicyFormProps = {
  project: Project;
};

export const CycleTimePolicyForm: FC<CycleTimePolicyFormProps> = ({
  project,
}) => {
  const {
    cycleTimePolicy,
    setCycleTimePolicy,
    savedPolicyId,
    setSavedPolicyId,
  } = useProjectContext();

  const setDefaultPolicy = useSetDefaultPolicy(project.id);
  const updatePolicy = useUpdatePolicy(project.id);
  const { data: savedPolicies } = useGetPolicies(project.id);
  const saveCycleTimePolicy = useCreatePolicy(project.id);
  const deleteCycleTimePolicy = useDeletePolicy(project.id);

  if (!cycleTimePolicy) {
    return <LoadingSpinner />;
  }

  return (
    <EditCycleTimePolicyForm
      savedPolicyId={savedPolicyId}
      setSavedPolicyId={setSavedPolicyId}
      savedPolicies={savedPolicies}
      workflowScheme={project.workflowScheme}
      filterOptions={project}
      cycleTimePolicy={cycleTimePolicy}
      setCycleTimePolicy={setCycleTimePolicy}
      onMakeDefaultClicked={(policy) => setDefaultPolicy.mutate(policy.id)}
      onSaveClicked={(policy) => updatePolicy.mutate(policy)}
      saveCycleTimePolicy={saveCycleTimePolicy}
      deleteCycleTimePolicy={deleteCycleTimePolicy}
    />
  );
};
