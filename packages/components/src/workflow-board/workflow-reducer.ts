import { produce } from "immer";
import {
  WorkflowState,
  DraggableType,
  WorkflowStageColumn,
} from "./workflow-state";

type AnyFn<S> = (state: S, params: any) => S;
type Params<H extends AnyFn<any>> = H extends (
  state: any,
  params: infer P,
) => any
  ? P
  : never;

function createReducer<S>() {
  return <H extends Record<string, AnyFn<S>>>(handlers: H) => {
    type Action = {
      [K in keyof H & string]: { type: K } & Params<H[K]>;
    }[keyof H & string];
    return {
      reducer: (state: S, action: Action): S =>
        (handlers[action.type as keyof H] as AnyFn<S>)(state, action as any),
      actions: Object.fromEntries(
        Object.keys(handlers).map((key) => [
          key,
          (params: object) => ({ type: key, ...params }),
        ]),
      ) as unknown as {
        [K in keyof H & string]: (
          params: Params<H[K]>,
        ) => { type: K } & Params<H[K]>;
      },
    };
  };
}

export const { reducer: workflowStateReducer, actions: workflowActions } =
  createReducer<WorkflowState>()({
    reorderColumns: produce(
      (
        draft: WorkflowState,
        {
          sourceColumnId,
          newColumnIndex,
        }: { sourceColumnId: string; newColumnIndex: number },
      ) => {
        const columnIndex = draft.columnOrder.indexOf(sourceColumnId);
        draft.columnOrder.splice(columnIndex, 1);
        draft.columnOrder.splice(newColumnIndex, 0, sourceColumnId);
      },
    ),

    reorderStatuses: produce(
      (
        draft: WorkflowState,
        {
          columnId,
          statusId,
          newStatusIndex,
        }: { columnId: string; statusId: string; newStatusIndex: number },
      ) => {
        const column = draft.columns[columnId];
        const statusIndex = column.statusIds.indexOf(statusId);
        column.statusIds.splice(statusIndex, 1);
        column.statusIds.splice(newStatusIndex, 0, statusId);
      },
    ),

    deleteColumn: produce(
      (draft: WorkflowState, { columnId }: { columnId: string }) => {
        const column = draft.columns[columnId];
        const columnIndex = draft.columnOrder.indexOf(columnId);

        draft.columns[DraggableType.Unused].statusIds.push(...column.statusIds);
        draft.columnOrder.splice(columnIndex, 1);

        delete draft.columns[columnId];
      },
    ),

    renameColumn: produce(
      (
        draft: WorkflowState,
        { columnId, newTitle }: { columnId: string; newTitle: string },
      ) => {
        draft.columns[columnId].title = newTitle;
      },
    ),

    addColumn: produce(
      (
        draft: WorkflowState,
        {
          sourceColumnId,
          sourceIndex,
        }: { sourceColumnId: string; sourceIndex: number },
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
      },
    ),

    moveToColumn: produce(
      (
        draft: WorkflowState,
        {
          sourceColumnId,
          sourceIndex,
          targetColumnId,
          targetIndex,
        }: {
          sourceColumnId: string;
          sourceIndex: number;
          targetColumnId: string;
          targetIndex: number;
        },
      ) => {
        const [statusId] = draft.columns[sourceColumnId].statusIds.splice(
          sourceIndex,
          1,
        );
        draft.columns[targetColumnId].statusIds.splice(
          targetIndex,
          0,
          statusId,
        );
      },
    ),
  });

export type WorkflowAction = Parameters<typeof workflowStateReducer>[1];
