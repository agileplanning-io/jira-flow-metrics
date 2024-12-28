import { useProjectContext } from "./context";
import { LoadingSpinner } from "../components/loading-spinner";
import { Outlet } from "react-router-dom";
import { CycleTimePolicyForm } from "./reports/components/filter-form/cycle-time-policy-form";
import { useState } from "react";

export type ProjectsContext = {
  hidePolicyForm: () => void;
};

export const ProjectsLayout = () => {
  const { project } = useProjectContext();
  const [showPolicyForm, setShowPolicyForm] = useState(true);
  const hidePolicyForm = () => setShowPolicyForm(false);

  if (!project) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {showPolicyForm ? <CycleTimePolicyForm project={project} /> : null}
      <Outlet context={{ hidePolicyForm }} />
    </>
  );
};
