import {
  StatusCategory,
  TransitionStatus,
  Workflow,
  WorkflowStage,
} from "@agileplanning-io/flow-metrics";
import { flatten } from "remeda";

export type Status = {
  id: string;
  status: TransitionStatus;
};

export type WorkflowStageColumn = {
  id: string;
  title: string;
  statusIds: string[];
};

/**
 * Represents the view state for a workflow being edited.
 *
 * This is currently distinct from the `Workflow` type in a couple of ways:
 *
 * 1. The record types ensure uniqueness of columns and statuses.
 * 2. It includes a special 'unused' column for unused statuses.
 */
export type WorkflowState = {
  statuses: Record<string, Status>;
  columns: Record<string, WorkflowStageColumn>;
  columnOrder: string[];
};

/**
 * The type of the draggable elements on the board. In the cases of types for which there is only
 * one unique column, the type can also be used as the column ID.
 */
export enum DraggableType {
  Unused = "unused",
  NewColumn = "new-column",
  WorkstageColumn = "workstage-column",
  Status = "status",
}

export const stateToWorkflow = (state: WorkflowState): Workflow => {
  const stages = state.columnOrder.map((columnId) => {
    const column = state.columns[columnId];
    const statuses = column.statusIds.map(
      (statusId) => state.statuses[statusId].status,
    );
    const selectByDefault = statuses.some(
      (status) => status.category === StatusCategory.InProgress,
    );
    return {
      name: column.title,
      selectByDefault,
      statuses,
    };
  });

  const statuses = Object.values(state.statuses).map((status) => status.status);

  return { stages, statuses };
};

export const workflowToState = (workflow: Workflow): WorkflowState => {
  const statusId = (status: TransitionStatus) => `status:${status.name}`;
  const colId = (stage: WorkflowStage) => `col:${stage.name}`;

  const statuses = Object.fromEntries(
    workflow.statuses.map((status) => [
      statusId(status),
      {
        id: statusId(status),
        status: status,
      },
    ]),
  );

  const workflowColumns: WorkflowStageColumn[] = workflow.stages.map(
    (stage) => ({
      id: colId(stage),
      title: stage.name,
      statusIds: stage.statuses.map((status) => statusId(status)),
    }),
  );

  const usedStatusIds = new Set(
    flatten(workflowColumns.map((column) => column.statusIds)),
  );
  const unusedStatusIds = Object.values(statuses)
    .filter((status) => !usedStatusIds.has(status.id))
    .map((status) => status.id);

  workflowColumns.push({
    id: DraggableType.Unused,
    title: "Unused",
    statusIds: unusedStatusIds,
  });

  const columns = Object.fromEntries(
    workflowColumns.map((stage) => [stage.id, stage]),
  );

  const columnOrder = workflow.stages.map((stage) => colId(stage));

  const workflowState: WorkflowState = {
    statuses: statuses,
    columns,
    columnOrder,
  };

  return workflowState;
};
