import { IssueAttributesFilter } from "../../issues";

export type StatusCycleTimePolicy = {
  type: "status";
  includeWaitTime: boolean;
  statuses?: string[];
};

export type ComputedCycleTimePolicy = IssueAttributesFilter & {
  type: "computed";
};

export type CycleTimePolicy = {
  stories: StatusCycleTimePolicy;
  epics: StatusCycleTimePolicy | ComputedCycleTimePolicy;
};
