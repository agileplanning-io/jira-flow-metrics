import { Table, Tag } from "antd";
import { FC, Key } from "react";
import { WorkflowStage } from "./workflow-board/workflow-state";
import { TransitionStatus } from "@agileplanning-io/flow-metrics";

export type WorkflowStagesTableProps = {
  workflowStages: WorkflowStage[] | undefined;
  selectedStages: string[] | undefined;
  onSelectionChanged: (selectedStages: Key[]) => void;
};

export const WorkflowStagesTable: FC<WorkflowStagesTableProps> = ({
  workflowStages,
  selectedStages,
  onSelectionChanged,
}) => {
  return (
    <Table
      size="small"
      rowKey="name"
      showHeader={false}
      rowSelection={{
        selectedRowKeys: selectedStages,
        onChange: onSelectionChanged,
      }}
      dataSource={workflowStages}
      pagination={false}
      columns={[
        {
          title: "Stage",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Statuses",
          dataIndex: "statuses",
          key: "statuses",
          render: (statuses: TransitionStatus[]) => (
            <>
              {statuses.map((status) => (
                <Tag
                  bordered={true}
                  key={status.name}
                  color="#f9f9f9"
                  style={{ color: "#999", borderColor: "#eee" }}
                >
                  {status.name}
                </Tag>
              ))}
            </>
          ),
        },
      ]}
    />
  );
};
