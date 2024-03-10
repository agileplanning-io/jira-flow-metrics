import { FC, useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import {
  Project,
  WorkflowStage,
  addColumn,
  projectToState,
  deleteColumn,
  moveToColumn,
  renameColumn,
  reorderColumns,
  reorderTasks,
  stateToWorkflow,
} from "./state";
import { WorkflowStageCard } from "./column";
import { Flex } from "antd";

const Container = styled.div`
  display: flex;
`;

export const WorkflowBoard: FC<{
  project: Project;
  onWorkflowChanged: (workflow: WorkflowStage[]) => void;
  disabled: boolean;
}> = ({ project, onWorkflowChanged, disabled }) => {
  const [state, setState] = useState(() => projectToState(project));

  useEffect(() => {
    onWorkflowChanged(stateToWorkflow(state));
  }, [state, onWorkflowChanged]);

  const onDragEnd: OnDragEndResponder = (event) => {
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
      setState(
        reorderColumns(state, {
          columnId: draggableId,
          destination,
        }),
      );
      return;
    }

    if (source.droppableId === destination.droppableId) {
      setState(
        reorderTasks(state, {
          columnId: source.droppableId,
          taskId: draggableId,
          destination,
        }),
      );
      return;
    }

    if (destination.droppableId === "new-column") {
      setState(
        addColumn(state, {
          source,
          taskIndex: source.index,
        }),
      );
      return;
    }

    setState(
      moveToColumn(state, {
        source,
        destination,
        taskId: draggableId,
      }),
    );
  };

  const onDeleteColumn = (columnId: string) => {
    setState(deleteColumn(state, columnId));
  };

  const onRenameColumn = (columnId: string, newTitle: string) => {
    setState(renameColumn(state, columnId, newTitle));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex>
        <Droppable
          droppableId="unused-tasks"
          type="unused"
          isDropDisabled={disabled}
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              <WorkflowStageCard
                key="unused"
                column={state.columns["unused"]}
                tasks={state.columns["unused"].statusIds.map(
                  (taskId) => state.tasks[taskId],
                )}
                index={0}
                isDragDisabled={true}
                disabled={disabled}
              />
            </Container>
          )}
        </Droppable>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {state.columnOrder.map((columnId, index) => {
                const column = state.columns[columnId];
                const tasks = column.statusIds.map(
                  (taskId) => state.tasks[taskId],
                );
                return (
                  <WorkflowStageCard
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    isDragDisabled={false}
                    disabled={disabled}
                    onDelete={onDeleteColumn}
                    onRenamed={onRenameColumn}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
        <Droppable droppableId="create-column" type="new-column">
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              <WorkflowStageCard
                key="new-column"
                column={{
                  id: "new-column",
                  statusIds: [],
                  title: "New Column",
                }}
                tasks={[]}
                index={0}
                isDragDisabled={true}
                disabled={disabled}
              />
            </Container>
          )}
        </Droppable>
      </Flex>
    </DragDropContext>
  );
};
