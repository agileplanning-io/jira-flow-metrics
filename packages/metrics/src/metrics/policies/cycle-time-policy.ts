import { IssueAttributesFilter } from "../../issues";

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
