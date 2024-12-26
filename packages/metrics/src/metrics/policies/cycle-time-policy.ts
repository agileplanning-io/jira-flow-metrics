import { isDeepEqual, omit } from "remeda";
import { isAttributesFilterEqual, IssueAttributesFilter } from "../../issues";

export enum CycleTimePolicyType {
  ProcessTime = "ProcessTime",
  LeadTime = "LeadTime",
}

export enum EpicCycleTimePolicyType {
  EpicStatus = "EpicStatus",
  Derived = "Derived",
}

export type StatusCycleTimePolicy = {
  statuses: string[];
};

export type EpicCycleTimePolicy =
  | ({
      type: EpicCycleTimePolicyType.EpicStatus;
    } & StatusCycleTimePolicy)
  | ({
      type: EpicCycleTimePolicyType.Derived;
    } & IssueAttributesFilter);

export type CycleTimePolicy = StatusCycleTimePolicy & {
  type: CycleTimePolicyType;
  epics: EpicCycleTimePolicy;
};

export const isPolicyEqual = (
  policy1: CycleTimePolicy,
  policy2: CycleTimePolicy,
) => {
  if (
    policy1.epics.type === EpicCycleTimePolicyType.Derived &&
    policy2.epics.type === policy1.epics.type
  ) {
    const filtersEqual = isAttributesFilterEqual(policy1.epics, policy2.epics);
    return (
      filtersEqual &&
      isDeepEqual(omit(policy1, ["epics"]), omit(policy2, ["epics"]))
    );
  }
  return isDeepEqual(policy1, policy2);
};
