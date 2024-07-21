import { IssueAttributesFilter } from "../../issues";

export type StatusCycleTimePolicy = {
  type: "status";
  includeWaitTime: boolean;
  statuses?: string[];
};

export type StatusCategoryCycleTimePolicy = {
  type: "statusCategory";
  includeWaitTime: boolean;
  statuses?: undefined;
};

export type ComputedCycleTimePolicy = IssueAttributesFilter & {
  type: "computed";
  includeWaitTime: boolean;
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
