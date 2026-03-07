import { createReducer } from "../lib/create-reducer";
import {
  WorkflowState,
  DraggableType,
  WorkflowStageColumn,
} from "./workflow-state";

type ReorderColumnsPayload = { sourceColumnId: string; newColumnIndex: number };

const reorderColumns = (
  draft: WorkflowState,
  { sourceColumnId, newColumnIndex }: ReorderColumnsPayload,
) => {
  const columnIndex = draft.columnOrder.indexOf(sourceColumnId);
  draft.columnOrder.splice(columnIndex, 1);
  draft.columnOrder.splice(newColumnIndex, 0, sourceColumnId);
};

type ReorderStatusesPayload = {
  columnId: string;
  statusId: string;
  newStatusIndex: number;
};

const reorderStatuses = (
  draft: WorkflowState,
  { columnId, statusId, newStatusIndex }: ReorderStatusesPayload,
) => {
  const column = draft.columns[columnId];
  const statusIndex = column.statusIds.indexOf(statusId);
  column.statusIds.splice(statusIndex, 1);
  column.statusIds.splice(newStatusIndex, 0, statusId);
};

type DeleteColumnPayload = { columnId: string };

const deleteColumn = (
  draft: WorkflowState,
  { columnId }: DeleteColumnPayload,
) => {
  const column = draft.columns[columnId];
  const columnIndex = draft.columnOrder.indexOf(columnId);

  draft.columns[DraggableType.Unused].statusIds.push(...column.statusIds);
  draft.columnOrder.splice(columnIndex, 1);

  delete draft.columns[columnId];
};

type RenameColumnPayload = { columnId: string; newTitle: string };

const renameColumn = (
  draft: WorkflowState,
  { columnId, newTitle }: RenameColumnPayload,
) => {
  draft.columns[columnId].title = newTitle;
};

type AddColumnPayload = { sourceColumnId: string; sourceIndex: number };

const addColumn = (
  draft: WorkflowState,
  { sourceColumnId, sourceIndex }: AddColumnPayload,
) => {
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
};

type MoveToColumnPayload = {
  sourceColumnId: string;
  sourceIndex: number;
  targetColumnId: string;
  targetIndex: number;
};

const moveToColumn = (
  draft: WorkflowState,
  {
    sourceColumnId,
    sourceIndex,
    targetColumnId,
    targetIndex,
  }: MoveToColumnPayload,
) => {
  const [statusId] = draft.columns[sourceColumnId].statusIds.splice(
    sourceIndex,
    1,
  );
  draft.columns[targetColumnId].statusIds.splice(targetIndex, 0, statusId);
};

export const { reducer: workflowStateReducer, actions: workflowActions } =
  createReducer({
    reorderColumns,
    reorderStatuses,
    deleteColumn,
    renameColumn,
    addColumn,
    moveToColumn,
  });

export type WorkflowAction = Parameters<typeof workflowStateReducer>[1];
