import { OnDragEndResponder } from "@hello-pangea/dnd";
import {
  ModifyWorkflowAction,
  ModifyWorkflowActionType,
} from "./workflow-state";

export const makeDragResponder =
  (dispatch: React.Dispatch<ModifyWorkflowAction>): OnDragEndResponder =>
  (event) => {
    const { destination, source, draggableId, type } = event;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      return dispatch({
        type: ModifyWorkflowActionType.ReorderColumns,
        sourceColumnId: draggableId,
        newColumnIndex: destination.index,
      });
    }

    if (source.droppableId === destination.droppableId) {
      return dispatch({
        type: ModifyWorkflowActionType.ReorderStatuses,
        columnId: source.droppableId,
        statusId: draggableId,
        newStatusIndex: destination.index,
      });
    }

    if (destination.droppableId === "new-column") {
      return dispatch({
        type: ModifyWorkflowActionType.AddColumn,
        sourceColumnId: source.droppableId,
        sourceIndex: source.index,
      });
    }

    return dispatch({
      type: ModifyWorkflowActionType.MoveToColumn,
      sourceColumnId: source.droppableId,
      sourceIndex: source.index,
      targetColumnId: destination.droppableId,
      targetIndex: destination.index,
      statusId: draggableId,
    });
  };
