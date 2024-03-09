import { useNavigationContext } from "../../navigation/context";
import { DatasetContext, DatasetContextType } from "./context";
import { useIssues } from "@data/issues";
import {
  CycleTimePolicy,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";
import { useParams } from "@lib/params";
import { z } from "zod";

const cycleTimePolicyParamsSchema = z.object({
  includeWaitTime: z.boolean().catch(false),
  policyStatuses: z.array(z.string()).optional(),
  policyLabels: z.array(z.string()).optional(),
  policyLabelFilterType: z
    .enum([LabelFilterType.Include, LabelFilterType.Exclude])
    .optional(),
});

type CycleTimePolicyParams = z.infer<typeof cycleTimePolicyParamsSchema>;

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dataset } = useNavigationContext();

  const [params, setParams] = useParams(cycleTimePolicyParamsSchema);

  const cycleTimePolicy = toPolicy(params);

  const { data: issues } = useIssues(
    dataset?.id,
    cycleTimePolicy.includeWaitTime,
    cycleTimePolicy.statuses,
    cycleTimePolicy.labels,
    cycleTimePolicy.labelFilterType,
  );

  const value: DatasetContextType = {
    dataset,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy: (policy: CycleTimePolicy) =>
      setParams(fromPolicy(policy)),
  };

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};

function toPolicy(params: CycleTimePolicyParams): CycleTimePolicy {
  return {
    includeWaitTime: params.includeWaitTime,
    labelFilterType: params.policyLabelFilterType,
    labels: params.policyLabels,
    statuses: params.policyStatuses,
  };
}

const fromPolicy = (policy: CycleTimePolicy): CycleTimePolicyParams => {
  return {
    includeWaitTime: policy.includeWaitTime,
    policyLabelFilterType: policy.labelFilterType,
    policyLabels: policy.labels,
    policyStatuses: policy.statuses,
  };
};
