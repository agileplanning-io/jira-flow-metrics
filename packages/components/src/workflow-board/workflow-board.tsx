import { FC, useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import {
  Workflow,
  WorkflowStage,
  addColumn,
  projectToState,
  deleteColumn,
  moveToColumn,
  renameColumn,
  reorderColumns,
  reorderStatuses,
  stateToWorkflow,
} from "./state";
import { WorkflowStageCard } from "./column";
import { Flex } from "antd";
import { validateWorkflow } from "./validation";

const Container = styled.div`
  display: flex;
`;

export type WorkflowBoardProps = {
  workflow: Workflow;
  onWorkflowChanged: (
    workflow: WorkflowStage[],
    validationErrors?: string[],
  ) => void;
  disabled: boolean;
  readonly: boolean;
};

export const WorkflowBoard: FC<WorkflowBoardProps> = ({
  workflow: project,
  onWorkflowChanged,
  disabled,
  readonly,
}) => {
  const [state, setState] = useState(() => projectToState(project));

  useEffect(() => {
    const workflow = stateToWorkflow(state);
    const validationErrors = validateWorkflow(workflow);
    onWorkflowChanged(workflow, validationErrors);
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
        reorderStatuses(state, {
          columnId: source.droppableId,
          statusId: draggableId,
          destination,
        }),
      );
      return;
    }

    if (destination.droppableId === "new-column") {
      setState(
        addColumn(state, {
          source,
          statusIndex: source.index,
        }),
      );
      return;
    }

    setState(
      moveToColumn(state, {
        source,
        destination,
        statusId: draggableId,
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
      <Flex style={{ margin: "0 -4px", overflowX: "auto" }}>
        <Droppable
          droppableId="unused-tasks"
          type="unused"
          isDropDisabled={disabled || readonly}
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              <WorkflowStageCard
                key="unused"
                column={state.columns["unused"]}
                tasks={state.columns["unused"].statusIds.map(
                  (taskId) => state.statuses[taskId],
                )}
                index={0}
                isDragDisabled={true}
                disabled={disabled}
                readonly={readonly}
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
                  (taskId) => state.statuses[taskId],
                );
                return (
                  <WorkflowStageCard
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    isDragDisabled={false}
                    disabled={disabled}
                    readonly={readonly}
                    onDelete={onDeleteColumn}
                    onRenamed={onRenameColumn}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
        {!readonly ? (
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
                  readonly={readonly}
                />
              </Container>
            )}
          </Droppable>
        ) : null}
      </Flex>
    </DragDropContext>
  );
};
