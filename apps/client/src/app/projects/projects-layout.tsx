import { useProjectContext } from "./context";
import { LoadingSpinner } from "../components/loading-spinner";
import { Outlet, useLocation } from "react-router-dom";
import { CycleTimePolicyForm } from "./reports/components/filter-form/cycle-time-policy-form";
import { useEffect, useState } from "react";

export type ProjectsContext = {
  hidePolicyForm: () => void;
};

export const ProjectsLayout = () => {
  const { project } = useProjectContext();
  const [showPolicyForm, setShowPolicyForm] = useState(true);
  const hidePolicyForm = () => setShowPolicyForm(false);
  const location = useLocation();

  useEffect(() => {
    setShowPolicyForm(true);
  }, [location.pathname]);

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
