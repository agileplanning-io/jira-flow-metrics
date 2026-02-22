import { FC, useState } from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { StatusCard } from "./status-card";
import { WorkflowStageColumn, Status, DraggableType } from "./workflow-state";
import { Button, Flex, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const Container = styled.div<{ $isDragging: boolean }>`
  margin: 4px;
  border: 1px solid lightgrey;
  background-color: white;
  border-radius: 2px;
  width: 220px;

  display: flex;
  flex-direction: column;
  opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};
`;

const StatusList = styled.div<{ $isDraggingOver: boolean }>`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${(props) =>
    props.$isDraggingOver ? "lightgrey" : "inherit"};
  flex-grow: 1;
  min-height: 100px;
`;

export type WorkflowStageCardProps = {
  column: WorkflowStageColumn;
  tasks: Status[];
  index: number;
  isDragDisabled: boolean;
  disabled: boolean;
  readonly: boolean;
  onRenamed?: (columnId: string, newTitle: string) => void;
  onDelete?: (columnId: string) => void;
};

export const WorkflowStageCard: FC<WorkflowStageCardProps> = ({
  column,
  index,
  tasks,
  isDragDisabled,
  disabled,
  readonly,
  onRenamed,
  onDelete,
}) => {
  const [title, setTitle] = useState(column.title);
  return (
    <Draggable
      draggableId={column.id}
      index={index}
      isDragDisabled={disabled || readonly || isDragDisabled}
    >
      {(provided, selection) => (
        <Container
          {...provided.draggableProps}
          ref={provided.innerRef}
          $isDragging={selection.isDragging}
        >
          <Flex>
            <Typography.Text
              disabled={disabled}
              editable={
                onRenamed && !disabled && !readonly
                  ? {
                      text: title,
                      onChange: (title) => {
                        setTitle(title);
                        onRenamed?.(column.id, title);
                      },
                    }
                  : undefined
              }
              style={{ margin: 10, flexGrow: 1 }}
              {...provided.dragHandleProps}
            >
              {title}
            </Typography.Text>
            {onDelete && !readonly ? (
              <Button
                size="small"
                style={{ margin: 5, marginLeft: "auto" }}
                type="text"
                onClick={() => onDelete?.(column.id)}
                icon={<DeleteOutlined />}
                disabled={disabled}
              />
            ) : null}
          </Flex>
          <Droppable droppableId={column.id} type={DraggableType.Status}>
            {(provided, snapshot) => (
              <StatusList
                ref={provided.innerRef}
                {...provided.droppableProps}
                $isDraggingOver={snapshot.isDraggingOver}
              >
                {tasks.map((task, index) => (
                  <StatusCard
                    key={task.id}
                    task={task}
                    index={index}
                    disabled={disabled || readonly}
                  />
                ))}
                {provided.placeholder}
              </StatusList>
            )}
          </Droppable>
        </Container>
      )}
    </Draggable>
  );
};
