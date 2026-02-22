import { FC } from "react";
import styled from "@emotion/styled";
import { Draggable } from "@hello-pangea/dnd";
import { Status } from "./workflow-state";
import { Flex, Tag } from "antd";

const Container = styled.div<{ $isDragging: boolean }>`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: white;
  opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};
`;

export type StatusCardProps = {
  status: Status;
  index: number;
  disabled: boolean;
};

const categoryColors = {
  "To Do": "grey",
  "In Progress": "blue",
  Done: "green",
};

export const StatusCard: FC<StatusCardProps> = ({
  status,
  index,
  disabled,
}) => {
  return (
    <Draggable draggableId={status.id} index={index} isDragDisabled={disabled}>
      {(provided, snapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          $isDragging={snapshot.isDragging}
        >
          <Flex align="flex-start">
            <span>{status.status.name}</span>
            <Tag
              style={{ marginLeft: "auto", marginRight: 0 }}
              color={categoryColors[status.status.category]}
            >
              {status.status.category}
            </Tag>
          </Flex>
        </Container>
      )}
    </Draggable>
  );
};
