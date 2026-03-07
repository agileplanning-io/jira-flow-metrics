import { OnDragEndResponder } from "@hello-pangea/dnd";
import { DraggableType } from "./workflow-state";
import { WorkflowAction, workflowActions } from "./workflow-reducer";

export const makeDragResponder =
  (dispatch: React.Dispatch<WorkflowAction>): OnDragEndResponder =>
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

    if (type === DraggableType.WorkstageColumn) {
      return dispatch(
        workflowActions.reorderColumns({
          sourceColumnId: draggableId,
          newColumnIndex: destination.index,
        }),
      );
    }

    if (type === DraggableType.Status) {
      if (source.droppableId === destination.droppableId) {
        return dispatch(
          workflowActions.reorderStatuses({
            columnId: source.droppableId,
            statusId: draggableId,
            newStatusIndex: destination.index,
          }),
        );
      } else if (destination.droppableId === DraggableType.NewColumn) {
        return dispatch(
          workflowActions.addColumn({
            sourceColumnId: source.droppableId,
            sourceIndex: source.index,
          }),
        );
      } else {
        return dispatch(
          workflowActions.moveToColumn({
            sourceColumnId: source.droppableId,
            sourceIndex: source.index,
            targetColumnId: destination.droppableId,
            targetIndex: destination.index,
          }),
        );
      }
    }
  };
