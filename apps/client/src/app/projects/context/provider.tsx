import { useNavigationContext } from "../../navigation/context";
import {
  ComputedCycleTimePolicy,
  ProjectContext,
  ProjectContextType,
} from "./context";
import { useIssues } from "@data/issues";
import { useSearchParams } from "react-router-dom";
import { LabelFilterType } from "@agileplanning-io/flow-metrics";
import { equals, pick } from "rambda";
import { SearchParamsBuilder } from "@lib/search-params-builder";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const cycleTimePolicy = {
    includeWaitTime:
      searchParams.get("includeWaitTime") === "true" ?? undefined,
    statuses: searchParams.getAll("policyStatuses") ?? undefined,
    labels: searchParams.getAll("policyLabels") ?? undefined,
    labelFilterType:
      (searchParams.get("policyLabelFilterType") as LabelFilterType) ??
      undefined,
  };

  const { data: issues } = useIssues(
    project?.id,
    cycleTimePolicy?.includeWaitTime ?? false,
    cycleTimePolicy?.statuses,
    cycleTimePolicy?.labels,
    cycleTimePolicy?.labelFilterType,
  );

  const setCycleTimePolicy = (newCycleTimePolicy: ComputedCycleTimePolicy) => {
    const fieldsToCompare = [
      "includeWaitTime",
      "statuses",
      "labels",
      "labelFilterType",
    ];
    const changed = !equals(
      pick(fieldsToCompare, newCycleTimePolicy),
      pick(fieldsToCompare, cycleTimePolicy),
    );
    if (changed) {
      setSearchParams(
        (prev) => {
          return new SearchParamsBuilder(prev)
            .set("includeWaitTime", newCycleTimePolicy.includeWaitTime)
            .setAll("policyStatuses", newCycleTimePolicy.statuses)
            .setAll("policyLabels", newCycleTimePolicy.labels)
            .set("policyLabelFilterType", newCycleTimePolicy.labelFilterType)
            .getParams();
        },
        { replace: true },
      );
    }
  };

  const value: ProjectContextType = {
    project,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
