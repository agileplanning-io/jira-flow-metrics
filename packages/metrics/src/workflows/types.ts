import { flat } from "remeda";
import { TransitionStatus } from "../issues";

export type WorkflowStage = {
  name: string;
  selectByDefault: boolean;
  statuses: TransitionStatus[];
};

export type Workflow = {
  stages: WorkflowStage[];
  statuses: TransitionStatus[];
};

export type WorkflowScheme = {
  stories: Workflow;
  epics: Workflow;
};

export const statusesInWorkflowStages = (stages: WorkflowStage[]): string[] =>
  flat(stages.map((stage) => stage.statuses.map((status) => status.name)));
