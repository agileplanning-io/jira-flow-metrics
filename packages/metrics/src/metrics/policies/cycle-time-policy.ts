import { IssueAttributesFilter } from "../../issues";

export type StatusCycleTimePolicy = {
  type: "status";
  includeWaitTime: boolean;
  statuses?: string[];
};

export type StatusCategoryCycleTimePolicy = {
  type: "statusCategory";
  includeWaitTime: boolean;
};

export type ComputedCycleTimePolicy = IssueAttributesFilter & {
  type: "computed";
};

export type CycleTimePolicy = {
  stories: StatusCycleTimePolicy | StatusCategoryCycleTimePolicy;
  epics:
    | StatusCycleTimePolicy
    | StatusCategoryCycleTimePolicy
    | ComputedCycleTimePolicy;
};
