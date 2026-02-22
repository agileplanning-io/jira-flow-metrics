import {
  StatusCategory,
  TransitionStatus,
  Workflow,
  WorkflowStage,
} from "@agileplanning-io/flow-metrics";
import { produce } from "immer";
import { flatten } from "remeda";
import { match } from "ts-pattern";

export type Status = {
  id: string;
  status: TransitionStatus;
};

export type WorkflowStageColumn = {
  id: string;
  title: string;
  statusIds: string[];
};

export type WorkflowState = {
  statuses: Record<string, Status>;
  columns: Record<string, WorkflowStageColumn>;
  columnOrder: string[];
};

/**
 * The type of the column on the screen. In the cases of types for which there is only one unique
 * column, the type can also be used as the column ID.
 */
export enum ColumnType {
  Unused = "unused",
  NewColumn = "new-column",
  WorkstageColumn = "workstage-column",
}

export enum ModifyWorkflowActionType {
  ReorderColumns = "reorder_columns",
  ReorderStatuses = "reorder_statuses",
  DeleteColumn = "delete_column",
  RenameColumn = "rename_column",
  AddColumn = "add_column",
  MoveToColumn = "move_to_column",
}

export type ModifyWorkflowAction =
  | ReorderColumnsParams
  | ReorderStatusesParams
  | DeleteColumnParams
  | RenameColumnParams
  | AddColumnParams
  | MoveToColumnParams;

type ReorderColumnsParams = {
  type: ModifyWorkflowActionType.ReorderColumns;
  sourceColumnId: string;
  newColumnIndex: number;
};

/**
 * A convenience function to curry application of the individual reducer functions in order to
 * remove some repetition in the workflowStateReducer.
 * @param {WorkflowState} state the workflow state
 * @returns A function which, given a reducer function `f`, applies `f` to the given `state`.
 */
const applyWithState =
  (state: WorkflowState) =>
  <T>(f: (state: WorkflowState, params: T) => WorkflowState) =>
  (params: T) =>
    f(state, params);

export const workflowStateReducer = (
  state: WorkflowState,
  action: ModifyWorkflowAction,
): WorkflowState => {
  const apply = applyWithState(state);

  return match(action)
    .with(
      { type: ModifyWorkflowActionType.ReorderColumns },
      apply(reorderColumns),
    )
    .with(
      { type: ModifyWorkflowActionType.ReorderStatuses },
      apply(reorderStatuses),
    )
    .with({ type: ModifyWorkflowActionType.DeleteColumn }, apply(deleteColumn))
    .with({ type: ModifyWorkflowActionType.RenameColumn }, apply(renameColumn))
    .with({ type: ModifyWorkflowActionType.AddColumn }, apply(addColumn))
    .with({ type: ModifyWorkflowActionType.MoveToColumn }, apply(moveToColumn))
    .exhaustive();
};

const reorderColumns = produce(
  (
    draft: WorkflowState,
    { sourceColumnId, newColumnIndex }: ReorderColumnsParams,
  ) => {
    const columnIndex = draft.columnOrder.indexOf(sourceColumnId);
    draft.columnOrder.splice(columnIndex, 1);
    draft.columnOrder.splice(newColumnIndex, 0, sourceColumnId);
  },
);

type ReorderStatusesParams = {
  type: ModifyWorkflowActionType.ReorderStatuses;
  columnId: string;
  statusId: string;
  newStatusIndex: number;
};

const reorderStatuses = produce(
  (
    draft: WorkflowState,
    { columnId, statusId, newStatusIndex }: ReorderStatusesParams,
  ) => {
    const column = draft.columns[columnId];
    const statusIndex = column.statusIds.indexOf(statusId);
    column.statusIds.splice(statusIndex, 1);
    column.statusIds.splice(newStatusIndex, 0, statusId);
  },
);

type DeleteColumnParams = {
  type: ModifyWorkflowActionType.DeleteColumn;
  columnId: string;
};

const deleteColumn = produce(
  (draft: WorkflowState, { columnId }: DeleteColumnParams) => {
    const column = draft.columns[columnId];
    const columnIndex = draft.columnOrder.indexOf(columnId);

    draft.columns[ColumnType.Unused].statusIds.push(...column.statusIds);
    draft.columnOrder.splice(columnIndex, 1);

    delete draft.columns[columnId];
  },
);

type RenameColumnParams = {
  type: ModifyWorkflowActionType.RenameColumn;
  columnId: string;
  newTitle: string;
};

const renameColumn = produce(
  (draft: WorkflowState, { columnId, newTitle }: RenameColumnParams) => {
    draft.columns[columnId].title = newTitle;
  },
);

type AddColumnParams = {
  type: ModifyWorkflowActionType.AddColumn;
  sourceColumnId: string;
  sourceIndex: number;
};

const addColumn = produce(
  (draft: WorkflowState, { sourceColumnId, sourceIndex }: AddColumnParams) => {
    const sourceColumn = draft.columns[sourceColumnId];
    const statusId = sourceColumn.statusIds[sourceIndex];
    const status = draft.statuses[statusId];

    const columnExists = (title: string) =>
      Object.values(draft.columns).some((column) => column.title === title);

    const buildNewColumn = (count?: number): WorkflowStageColumn => {
      const newTitle =
        count === undefined
          ? status.status.name
          : `${status.status.name} ${count}`;
      if (columnExists(newTitle)) {
        return buildNewColumn((count ?? 1) + 1);
      }
      return {
        id: `col:${newTitle}`,
        title: newTitle,
        statusIds: [status.id],
      };
    };

    const newColumn = buildNewColumn();

    sourceColumn.statusIds.splice(sourceIndex, 1);

    draft.columns[newColumn.id] = newColumn;
    draft.columnOrder.push(newColumn.id);
  },
);

type MoveToColumnParams = {
  type: ModifyWorkflowActionType.MoveToColumn;
  // TODO: do we need statusId _and_ source col/index?
  statusId: string;
  sourceColumnId: string;
  sourceIndex: number;
  targetColumnId: string;
  targetIndex: number;
};

const moveToColumn = produce(
  (
    draft: WorkflowState,
    {
      statusId,
      sourceColumnId,
      sourceIndex,
      targetColumnId,
      targetIndex,
    }: MoveToColumnParams,
  ) => {
    draft.columns[sourceColumnId].statusIds.splice(sourceIndex, 1);
    draft.columns[targetColumnId].statusIds.splice(targetIndex, 0, statusId);
  },
);

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
    id: ColumnType.Unused,
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
