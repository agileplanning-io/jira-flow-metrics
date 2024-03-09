import { useNavigationContext } from "../../navigation/context";
import { DatasetContext, DatasetContextType } from "./context";
import { useIssues } from "@data/issues";
import {
  CycleTimePolicy,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";
import { useParams } from "@lib/params";
import { z } from "zod";

const cycleTimePolicySchema = z.object({
  includeWaitTime: z.boolean().catch(false),
  policyStatuses: z.array(z.string()).optional(),
  policyLabels: z.array(z.string()).optional(),
  policyLabelFilterType: z
    .enum([LabelFilterType.Include, LabelFilterType.Exclude])
    .optional(),
});

type CycleTimePolicySchema = z.infer<typeof cycleTimePolicySchema>;

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dataset } = useNavigationContext();
  // const [searchParams, setSearchParams] = useSearchParams();

  // const cycleTimePolicy = useMemo(
  //   () => ({
  //     includeWaitTime:
  //       searchParams.get("includeWaitTime") === "true" ?? undefined,
  //     statuses: searchParams.getAll("policyStatuses") ?? undefined,
  //     labels: searchParams.getAll("policyLabels") ?? undefined,
  //     labelFilterType:
  //       (searchParams.get("policyLabelFilterType") as LabelFilterType) ??
  //       undefined,
  //   }),
  //   [searchParams],
  // );

  const [cycleTimePolicy, setCycleTimePolicy] = useParams(
    cycleTimePolicySchema,
  );

  console.info("DatasetProvier", { cycleTimePolicy });

  const { data: issues } = useIssues(
    dataset?.id,
    cycleTimePolicy.includeWaitTime,
    cycleTimePolicy.policyStatuses,
    cycleTimePolicy.policyLabels,
    cycleTimePolicy.policyLabelFilterType,
  );

  // const setCycleTimePolicy = (newCycleTimePolicy: CycleTimePolicy) => {
  //   const fieldsToCompare = [
  //     "includeWaitTime",
  //     "statuses",
  //     "labels",
  //     "labelFilterType",
  //   ];
  //   const changed = !equals(
  //     pick(fieldsToCompare, newCycleTimePolicy),
  //     pick(fieldsToCompare, cycleTimePolicy),
  //   );
  //   if (changed) {
  //     setSearchParams(
  //       (prev) => {
  //         return new SearchParamsBuilder(prev)
  //           .set("includeWaitTime", newCycleTimePolicy.includeWaitTime)
  //           .setAll("policyStatuses", newCycleTimePolicy.statuses)
  //           .setAll("policyLabels", newCycleTimePolicy.labels)
  //           .set("policyLabelFilterType", newCycleTimePolicy.labelFilterType)
  //           .getParams();
  //       },
  //       { replace: true },
  //     );
  //   }
  // };

  const value: DatasetContextType = {
    dataset,
    issues,
    cycleTimePolicy: toCycleTimePolicy(cycleTimePolicy),
    setCycleTimePolicy: (policy: CycleTimePolicy) =>
      setCycleTimePolicy(fromPolicy(policy)),
  };

  console.info("dataset provider", value);

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};

const toCycleTimePolicy = (policy: CycleTimePolicySchema): CycleTimePolicy => {
  return {
    includeWaitTime: policy.includeWaitTime,
    labelFilterType: policy.policyLabelFilterType,
    labels: policy.policyLabels,
    statuses: policy.policyStatuses,
  };
};

const fromPolicy = (policy: CycleTimePolicy): CycleTimePolicySchema => {
  return {
    includeWaitTime: policy.includeWaitTime,
    policyLabelFilterType: policy.labelFilterType,
    policyLabels: policy.labels,
    policyStatuses: policy.statuses,
  };
};
