import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import {
  Project,
  useCreatePolicy,
  useDeletePolicy,
  useGetPolicies,
  useSetDefaultPolicy,
  useUpdatePolicy,
} from "@data/projects";
import { FC } from "react";
import { EditCycleTimePolicyForm } from "@agileplanning-io/flow-components";

type CycleTimePolicyFormProps = {
  project: Project;
};

export const CycleTimePolicyForm: FC<CycleTimePolicyFormProps> = ({
  project,
}) => {
  const { currentPolicy, selectCycleTimePolicy, updateCurrentPolicy } =
    useProjectContext();

  const setDefaultPolicy = useSetDefaultPolicy(project.id);
  const updatePolicy = useUpdatePolicy(project.id);
  const { data: savedPolicies } = useGetPolicies(project.id);
  const saveCycleTimePolicy = useCreatePolicy(project.id);
  const deleteCycleTimePolicy = useDeletePolicy(project.id);

  if (!currentPolicy) {
    return <LoadingSpinner />;
  }

  return (
    <EditCycleTimePolicyForm
      currentPolicy={currentPolicy}
      defaultCompletedFilter={project.defaultCompletedFilter}
      selectCycleTimePolicy={selectCycleTimePolicy}
      updateCurrentPolicy={updateCurrentPolicy}
      savedPolicies={savedPolicies}
      workflowScheme={project.workflowScheme}
      filterOptions={project}
      onMakeDefaultClicked={(policy) => setDefaultPolicy.mutate(policy.id)}
      onSaveClicked={(policy) => updatePolicy.mutate(policy)}
      saveCycleTimePolicy={(policy) =>
        saveCycleTimePolicy.mutateAsync(policy, {
          onSuccess: (policy) => selectCycleTimePolicy(policy.id),
        })
      }
      deleteCycleTimePolicy={deleteCycleTimePolicy.mutateAsync}
    />
  );
};
