import { useDatasetContext } from "./context";
import { LoadingSpinner } from "../components/loading-spinner";
import { Outlet } from "react-router-dom";
import { CycleTimePolicyForm } from "./reports/components/filter-form/cycle-time-policy-form";

export const DatasetsLayout = () => {
  const { dataset } = useDatasetContext();

  if (!dataset) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CycleTimePolicyForm />
      <Outlet />
    </>
  );
};
