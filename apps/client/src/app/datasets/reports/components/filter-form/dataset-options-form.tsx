import { Key, useEffect, useState } from "react";
import { LabelFilterType, TransitionStatus } from "@jbrunton/flow-metrics";
import {
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  SelectProps,
  Space,
  Table,
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

export type DatasetOptions = {
  statuses?: string[];
  includeWaitTime: boolean;
  labels?: string[];
  components?: string[];
  labelFilterType?: LabelFilterType;
};

export const DatasetOptionsForm = () => {
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>();
  const [searchParams] = useSearchParams();
  const { dataset, datasetOptions, setDatasetOptions, issues } =
    useDatasetContext();

  const selectedStages = dataset?.workflow
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          datasetOptions?.statuses?.some(
            (datasetStatus) => datasetStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);

  const initialized = workflowStages && searchParams.get("datasetStatuses");

  useEffect(() => {
    if (!dataset || !selectedStages || initialized) return;

    const workflowStages = dataset.workflow;
    setWorkflowStages(workflowStages);

    const defaultSelectedStages = workflowStages.filter(
      (stage) => stage.selectByDefault,
    );
    const defaultStatuses: string[] = flatten(
      defaultSelectedStages.map((stage) =>
        stage.statuses.map((status) => status.name),
      ),
    );
    setDatasetOptions({
      ...datasetOptions,
      statuses: defaultStatuses,
      labelFilterType: LabelFilterType.Include,
    });
  }, [
    dataset,
    datasetOptions,
    setDatasetOptions,
    setWorkflowStages,
    selectedStages,
    initialized,
  ]);

  const [components, setComponents] = useState<SelectProps["options"]>();
  const [labels, setLabels] = useState<SelectProps["options"]>();

  useEffect(() => {
    setLabels(makeOptions(dataset?.labels));
    setComponents(makeOptions(dataset?.components));
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
        datasetOptions?.includeWaitTime ? "Include" : "Exclude"
      } wait time`,
    },
  ];

  if (datasetOptions?.labels?.length) {
    options.push({
      label:
        datasetOptions.labelFilterType === LabelFilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: datasetOptions.labels.join(),
    });
  }
  if (datasetOptions?.components?.length) {
    options.push({
      label: "Components",
      value: datasetOptions.components.join(),
    });
  }

  const onStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      dataset?.workflow
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    setDatasetOptions({ ...datasetOptions, statuses });
  };

  const onIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    setDatasetOptions({ ...datasetOptions, includeWaitTime: e.target.checked });
  };

  const onLabelsChanged = (labels: string[]) => {
    setDatasetOptions({ ...datasetOptions, labels });
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    setDatasetOptions({ ...datasetOptions, labelFilterType });
  };

  const onComponentsChanged = (components: string[]) => {
    setDatasetOptions({ ...datasetOptions, components });
  };

  return (
    <ExpandableOptions
      header={{
        title: "Dataset Options",
        options,
      }}
      extra={issues ? <Tag>{issues.length} issues</Tag> : null}
    >
      <Form layout="vertical">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Form.Item label="Selected Stages">
              <Table
                size="small"
                rowKey="name"
                showHeader={false}
                rowSelection={{
                  selectedRowKeys: selectedStages,
                  onChange: onStagesChanged,
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
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Checkbox
            checked={datasetOptions.includeWaitTime}
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
                    value={datasetOptions.labelFilterType}
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
                    value={datasetOptions.labels}
                    onChange={onLabelsChanged}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Components">
              <Select
                mode="multiple"
                allowClear={true}
                options={components}
                value={datasetOptions.components}
                onChange={onComponentsChanged}
              />
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
