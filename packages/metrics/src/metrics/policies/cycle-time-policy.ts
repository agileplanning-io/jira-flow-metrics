import { IssueAttributesFilter } from "../../issues";

export enum CycleTimeType {
  InProgressTime = "inProgressTime",
  TotalLeadTime = "totalLeadTime",
}

export type StatusCycleTimePolicy = {
  type: "status";
  cycleTimeType: CycleTimeType;
  statuses?: string[];
};

export type StatusCategoryCycleTimePolicy = {
  type: "statusCategory";
  cycleTimeType: CycleTimeType;
  statuses?: undefined;
};

export type ComputedCycleTimePolicy = IssueAttributesFilter & {
  type: "computed";
  cycleTimeType: CycleTimeType;
};

export type TransitionCycleTimePolicy =
  | StatusCycleTimePolicy
  | StatusCategoryCycleTimePolicy;

export type EpicCycleTimePolicy =
  | TransitionCycleTimePolicy
  | ComputedCycleTimePolicy;

export type CycleTimePolicy = {
  stories: TransitionCycleTimePolicy;
  epics: EpicCycleTimePolicy;
};
