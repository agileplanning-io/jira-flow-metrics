import { useProjectContext } from "./context";
import { LoadingSpinner } from "../components/loading-spinner";
import { Outlet } from "react-router-dom";
import { CycleTimePolicyForm } from "./reports/components/filter-form/cycle-time-policy-form";

export const ProjectsLayout = () => {
  const { project } = useProjectContext();

  if (!project) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CycleTimePolicyForm />
      <Outlet />
    </>
  );
};
