import { useNavigationContext } from "../../navigation/context";
import { DatasetContext, DatasetContextType } from "./context";
import { DatasetOptions } from "../reports/components/filter-form/dataset-options-form";
import { useIssues } from "@data/issues";
import { useSearchParams } from "react-router-dom";
import { LabelFilterType } from "@jbrunton/flow-metrics";
import { equals, pick } from "rambda";
import { SearchParamsBuilder } from "@lib/search-params-builder";

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dataset } = useNavigationContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const datasetOptions = {
    includeWaitTime:
      searchParams.get("includeWaitTime") === "true" ?? undefined,
    statuses: searchParams.getAll("datasetStatuses") ?? undefined,
    labels: searchParams.getAll("labels") ?? undefined,
    labelFilterType:
      (searchParams.get("labelFilterType") as LabelFilterType) ?? undefined,
    components: searchParams.getAll("components") ?? undefined,
  };

  const { data: issues } = useIssues(
    dataset?.id,
    datasetOptions?.includeWaitTime ?? false,
    datasetOptions?.statuses,
    datasetOptions?.labels,
    datasetOptions?.labelFilterType,
    datasetOptions?.components,
  );

  const setDatasetOptions = (newDatasetOptions: DatasetOptions) => {
    const fieldsToCompare = [
      "includeWaitTime",
      "statuses",
      "labels",
      "labelFilterType",
      "components",
    ];
    const changed = !equals(
      pick(fieldsToCompare, newDatasetOptions),
      pick(fieldsToCompare, datasetOptions),
    );
    if (changed) {
      setSearchParams(
        (prev) => {
          return new SearchParamsBuilder(prev)
            .set("includeWaitTime", newDatasetOptions.includeWaitTime)
            .setAll("datasetStatuses", newDatasetOptions.statuses)
            .setAll("labels", newDatasetOptions.labels)
            .set("labelFilterType", newDatasetOptions.labelFilterType)
            .setAll("components", newDatasetOptions.components)
            .getParams();
        },
        { replace: true },
      );
    }
  };

  const value: DatasetContextType = {
    dataset,
    issues,
    datasetOptions,
    setDatasetOptions,
  };

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};
