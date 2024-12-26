import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  console.info("CycleTimePolicyForm", cycleTimePolicy);

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  return (
    <EditCycleTimePolicyForm
      project={project}
      cycleTimePolicy={cycleTimePolicy}
      setCycleTimePolicy={setCycleTimePolicy}
    />
  );
};
