import { Key, useEffect, useState } from "react";
import { LabelFilterType } from "@agileplanning-io/flow-metrics";
import {
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  SelectProps,
  Space,
  Tag,
} from "antd";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { WorkflowStage } from "@data/issues";
import { flatten } from "rambda";
import { useDatasetContext } from "@app/datasets/context";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useSearchParams } from "react-router-dom";
import { WorkflowStagesTable } from "@agileplanning-io/flow-components";

export const CycleTimePolicyForm = () => {
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>();
  const [searchParams] = useSearchParams();
  const { dataset, cycleTimePolicy, setCycleTimePolicy, issues } =
    useDatasetContext();

  const selectedStages = dataset?.workflow
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          cycleTimePolicy?.statuses?.some(
            (datasetStatus) => datasetStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);

  const initialized = workflowStages && searchParams.get("policyStatuses");

  useEffect(() => {
    if (!dataset || !selectedStages || initialized) return;

    setWorkflowStages(dataset.workflow);
    setCycleTimePolicy(dataset.defaultCycleTimePolicy);
  }, [
    dataset,
    cycleTimePolicy,
    setCycleTimePolicy,
    setWorkflowStages,
    selectedStages,
    initialized,
  ]);

  const [labels, setLabels] = useState<SelectProps["options"]>();

  useEffect(() => {
    setLabels(makeOptions(dataset?.labels));
  }, [dataset]);

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "stages",
      value: selectedStages
        ? `Stages=${selectedStages}`
        : "StatusCategory=In Progress",
    },
    {
      value: `${
        cycleTimePolicy?.includeWaitTime ? "Include" : "Exclude"
      } wait time`,
    },
  ];

  if (cycleTimePolicy?.labels?.length) {
    options.push({
      label:
        cycleTimePolicy.labelFilterType === LabelFilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: cycleTimePolicy.labels.join(),
    });
  }

  const onStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      dataset?.workflow
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    setCycleTimePolicy({ ...cycleTimePolicy, statuses });
  };

  const onIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    setCycleTimePolicy({
      ...cycleTimePolicy,
      includeWaitTime: e.target.checked,
    });
  };

  const onLabelsChanged = (labels: string[]) => {
    setCycleTimePolicy({ ...cycleTimePolicy, labels });
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    setCycleTimePolicy({ ...cycleTimePolicy, labelFilterType });
  };

  return (
    <ExpandableOptions
      header={{
        title: "Cycle Time Policy",
        options,
      }}
      extra={issues ? <Tag>{issues.length} issues</Tag> : null}
    >
      <Form layout="vertical">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Form.Item label="Selected Stages">
              <WorkflowStagesTable
                workflowStages={workflowStages}
                selectedStages={selectedStages}
                onSelectionChanged={onStagesChanged}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Checkbox
            checked={cycleTimePolicy.includeWaitTime}
            onChange={onIncludeWaitTimeChanged}
          >
            Include wait time
          </Checkbox>
        </Row>
        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Form.Item label="Labels" style={{ width: "100%" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item style={{ width: "25%" }}>
                  <Select
                    value={cycleTimePolicy.labelFilterType}
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
                    value={cycleTimePolicy.labels}
                    onChange={onLabelsChanged}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </ExpandableOptions>
  );
};

const makeOptions = (values?: string[]): SelectProps["options"] => {
  return values?.map((value) => ({
    label: value,
    value: value,
  }));
};
