import { LoadingSpinner } from "@app/components/loading-spinner";
import { Project, UpdateProjectParams, useUpdateProject } from "@data/projects";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Select,
  SelectProps,
  Space,
} from "antd";
import { FC, Key, useCallback, useState } from "react";
import {
  WorkflowBoard,
  WorkflowStagesTable,
} from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import { flatten } from "rambda";
import { LabelFilterType } from "@agileplanning-io/flow-metrics";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export type EditProjectFormProps = {
  project: Project;
  onClose: () => void;
};

export const EditProjectForm: FC<EditProjectFormProps> = ({
  project,
  onClose,
}) => {
  const [updatedWorkflow, setUpdatedWorkflow] =
    useState<UpdateProjectParams["workflow"]>();

  const [updatedCycleTimePolicy, setUpdatedCycleTimePolicy] = useState<
    UpdateProjectParams["defaultCycleTimePolicy"]
  >(project?.defaultCycleTimePolicy);

  const updateProject = useUpdateProject();

  const onWorkflowChanged = useCallback(
    (workflow: WorkflowStage[]) =>
      setUpdatedWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      ),
    [setUpdatedWorkflow],
  );

  const labels = makeOptions(project.labels);

  const onStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflow
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({ ...updatedCycleTimePolicy, statuses });
    }
  };

  const onIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        includeWaitTime: e.target.checked,
      });
    }
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        labelFilterType,
      });
    }
  };

  const onLabelsChanged = (labels: string[]) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        labels,
      });
    }
  };

  if (!project) {
    return <LoadingSpinner />;
  }

  const applyChanges = () => {
    if (updatedWorkflow && updatedCycleTimePolicy) {
      updateProject.mutate(
        {
          id: project.id,
          name: project.name,
          workflow: updatedWorkflow,
          defaultCycleTimePolicy: updatedCycleTimePolicy,
        },
        {
          onSuccess: onClose,
        },
      );
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Name">
        <Input value={project.name} />
      </Form.Item>
      <Form.Item label="Workflow" style={{ overflowX: "auto" }}>
        <WorkflowBoard
          project={project}
          onWorkflowChanged={onWorkflowChanged}
          disabled={updateProject.isLoading}
        />
      </Form.Item>

      <Form.Item label="Default Cycle Time Policy">
        <WorkflowStagesTable
          workflowStages={project.workflow}
          selectedStages={updatedCycleTimePolicy.statuses}
          onSelectionChanged={onStagesChanged}
        />
        <Checkbox
          checked={updatedCycleTimePolicy.includeWaitTime}
          onChange={onIncludeWaitTimeChanged}
        >
          Include wait time
        </Checkbox>

        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Form.Item label="Labels" style={{ width: "100%" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item style={{ width: "25%" }}>
                  <Select
                    value={updatedCycleTimePolicy.labelFilterType}
                    onChange={onLabelFilterTypeChanged}
                    options={[
                      { value: "include", label: "Include" },
                      { value: "exclude", label: "Exclude" },
                    ]}
                  />
                </Form.Item>
                <Form.Item style={{ width: "75%" }}>
                  <Select
                    mode="multiple"
                    allowClear={true}
                    options={labels}
                    value={updatedCycleTimePolicy.labels}
                    onChange={onLabelsChanged}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Button
        type="primary"
        onClick={applyChanges}
        loading={updateProject.isLoading}
        disabled={updatedWorkflow === undefined || updateProject.isLoading}
      >
        Apply Changes
      </Button>
    </Form>
  );
};

const makeOptions = (values?: string[]): SelectProps["options"] => {
  return values?.map((value) => ({
    label: value,
    value: value,
  }));
};
