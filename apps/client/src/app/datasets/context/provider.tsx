import { useNavigationContext } from "../../navigation/context";
import { DatasetContext, DatasetContextType } from "./context";
import { useIssues } from "@data/issues";
import { useSearchParams } from "react-router-dom";
import { CycleTimePolicy, LabelFilterType } from "@jbrunton/flow-metrics";
import { equals, pick } from "rambda";
import { SearchParamsBuilder } from "@lib/search-params-builder";

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dataset } = useNavigationContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const cycleTimePolicy = {
    includeWaitTime:
      searchParams.get("includeWaitTime") === "true" ?? undefined,
    statuses: searchParams.getAll("datasetStatuses") ?? undefined,
    labels: searchParams.getAll("datasetLabels") ?? undefined,
    labelFilterType:
      (searchParams.get("datasetLabelFilterType") as LabelFilterType) ??
      undefined,
  };

  const { data: issues } = useIssues(
    dataset?.id,
    cycleTimePolicy?.includeWaitTime ?? false,
    cycleTimePolicy?.statuses,
    cycleTimePolicy?.labels,
    cycleTimePolicy?.labelFilterType,
  );

  const setCycleTimePolicy = (newCycleTimePolicy: CycleTimePolicy) => {
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
            .setAll("datasetStatuses", newCycleTimePolicy.statuses)
            .setAll("datasetLabels", newCycleTimePolicy.labels)
            .set("datasetLabelFilterType", newCycleTimePolicy.labelFilterType)
            .getParams();
        },
        { replace: true },
      );
    }
  };

  const value: DatasetContextType = {
    dataset,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy,
  };

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};
