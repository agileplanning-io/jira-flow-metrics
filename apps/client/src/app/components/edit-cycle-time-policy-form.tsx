import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  FilterType,
  IssueAttributesFilter,
  StatusCycleTimePolicy,
  TransitionStatus,
  ValuesFilter,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import {
  Button,
  Col,
  Dropdown,
  Form,
  MenuProps,
  Popconfirm,
  Popover,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { clone, compact, flat } from "remeda";
import { FC, Key, useMemo } from "react";
import { EditFilterForm } from "@app/projects/reports/components/filter-form/edit-filter-form";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";
import {
  QuestionCircleOutlined,
  CaretDownOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { ellipsize } from "@agileplanning-io/flow-lib";

type EditCycleTimePolicyForm = {
  project: Project;
  cycleTimePolicy: CycleTimePolicy;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
};

export const EditCycleTimePolicyForm: FC<EditCycleTimePolicyForm> = ({
  project,
  cycleTimePolicy,
  setCycleTimePolicy,
}) => {
  const selectedStoryStages = useMemo(() => {
    return getSelectedStages(project.workflowScheme.stories, cycleTimePolicy);
  }, [project, cycleTimePolicy]);

  const selectedEpicStages = useMemo(() => {
    if (cycleTimePolicy.epics.type !== EpicCycleTimePolicyType.EpicStatus) {
      return undefined;
    }

    return getSelectedStages(
      project.workflowScheme.epics,
      cycleTimePolicy.epics,
    );
  }, [project, cycleTimePolicy]);

  const cycleTimePolicyType = cycleTimePolicy.type;
  const onStoryCycleTimePolicyTypeChanged = (type: CycleTimePolicyType) => {
    const policy = clone(cycleTimePolicy);
    if (type !== policy.type) {
      policy.type = type;
      setCycleTimePolicy(policy);
    }
  };

  const onStoryStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);

    const statuses: string[] = flat(
      project?.workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );

    policy.statuses = statuses;
    setCycleTimePolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);

    if (policy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
      const statuses: string[] = flat(
        project?.workflowScheme.epics.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
      );

      policy.epics.statuses = statuses;
      setCycleTimePolicy(policy);
    }
  };

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === EpicCycleTimePolicyType.Derived) {
      policy.epics = {
        type: EpicCycleTimePolicyType.Derived,
        ...filter,
      };
    }
    setCycleTimePolicy(policy);
  };

  const epicCycleTimePolicyType = cycleTimePolicy.epics.type;
  const onEpicCycleTimePolicyTypeChanged = (
    type: CycleTimePolicy["epics"]["type"],
  ) => {
    const policy = clone(cycleTimePolicy);
    if (type !== policy.epics.type) {
      if (type === EpicCycleTimePolicyType.EpicStatus) {
        policy.epics = {
          ...buildDefaultStatusesPolicy(project, "epics"),
          type: EpicCycleTimePolicyType.EpicStatus,
        };
      } else {
        policy.epics = { type: EpicCycleTimePolicyType.Derived };
      }
      setCycleTimePolicy(policy);
    }
  };

  const summariseFilter = (filter: IssueAttributesFilter) => {
    const summary: (string | undefined)[] = [];

    const summariseValuesFilter = (
      name: string,
      valuesFilter?: ValuesFilter,
    ) => {
      if (!valuesFilter?.values?.length) {
        return undefined;
      }

      const op =
        valuesFilter.values.length === 1
          ? valuesFilter.type === FilterType.Include
            ? "="
            : "!="
          : valuesFilter.type === FilterType.Include
          ? "in"
          : "excl.";

      return `${name} ${op} ${valuesFilter.values.join(",")}`;
    };

    summary.push(summariseValuesFilter("Resolution", filter.resolutions));
    summary.push(summariseValuesFilter("Labels", filter.labels));
    summary.push(summariseValuesFilter("Components", filter.components));
    summary.push(summariseValuesFilter("Issue Type", filter.issueTypes));

    return ellipsize(compact(summary).join(", "), 48);
  };

  const StoryPolicyForm = () => (
    <Form layout="vertical">
      <h3>Stories</h3>
      <Form.Item label="Story Policy Type">
        <Select
          value={cycleTimePolicyType}
          onChange={onStoryCycleTimePolicyTypeChanged}
          options={[
            { value: "ProcessTime", label: "Process Time" },
            { value: "LeadTime", label: "Lead Time" },
          ]}
        />
      </Form.Item>

      <Form.Item label="Selected Stages">
        <WorkflowStagesTable
          workflowStages={project?.workflowScheme.stories.stages}
          selectedStages={selectedStoryStages}
          onSelectionChanged={onStoryStagesChanged}
        />
      </Form.Item>
    </Form>
  );

  const EpicPolicyForm = () => (
    <>
      <Form layout="vertical">
        <h3>Epics</h3>
        <Form.Item label="Epic Policy Type">
          <Select
            value={epicCycleTimePolicyType}
            onChange={onEpicCycleTimePolicyTypeChanged}
            options={[
              { value: "Derived", label: "Derived" },
              { value: "EpicStatus", label: "Status" },
            ]}
          />
        </Form.Item>
      </Form>
      {epicCycleTimePolicyType === EpicCycleTimePolicyType.Derived ? (
        <EditFilterForm
          filter={cycleTimePolicy.epics}
          resolutions={project.resolutions}
          labels={project.labels}
          components={project.components}
          issueTypes={project.issueTypes}
          setFilter={onFilterChanged}
          showDateSelector={false}
          showAssigneesFilter={false}
          showHierarchyFilter={false}
          showResolutionFilter={true}
          showStatusFilter={false}
          labelColSpan={4}
          wrapperColSpan={20}
        />
      ) : (
        <Form layout="vertical">
          <Form.Item label="Selected Stages">
            <WorkflowStagesTable
              workflowStages={project?.workflowScheme.epics.stages}
              selectedStages={selectedEpicStages}
              onSelectionChanged={onEpicStagesChanged}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );

  const policyItems: MenuProps["items"] = [
    { label: "Process Time", key: CycleTimePolicyType.ProcessTime },
    { label: "Lead Time", key: CycleTimePolicyType.LeadTime },
  ];

  const epicPolicyItems: MenuProps["items"] = [
    { label: "Status", key: EpicCycleTimePolicyType.EpicStatus },
    { label: "Derived", key: EpicCycleTimePolicyType.Derived },
  ];

  return (
    <>
      <Space direction="vertical" style={{ marginBottom: 8, width: "100%" }}>
        <Space
          direction="horizontal"
          style={{
            background: "rgba(0, 0, 0, 0.02)",
            width: "100%",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <span style={{ whiteSpace: "normal" }}>
            <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
              Cycle time policy
              <Popover
                placement="bottom"
                content={
                  <span>
                    <Typography.Text code>Process Time</Typography.Text> is the
                    amount of time the issue spent in the selected workflow
                    stages.
                    <br />
                    <Typography.Text code>Lead Time</Typography.Text> is the
                    total time to completion (including wait time).
                  </span>
                }
              >
                {" "}
                <a href="#">
                  <QuestionCircleOutlined style={{ fontSize: 13 }} />
                </a>{" "}
              </Popover>
            </Typography.Text>
            <wbr />
            <Dropdown
              menu={{
                items: policyItems,
                onClick: (e) => onStoryCycleTimePolicyTypeChanged(e.key),
              }}
            >
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                {cycleTimePolicyType}
              </Button>
            </Dropdown>
          </span>

          <span>
            <Typography.Text type="secondary">Selected stages</Typography.Text>
            <Popover
              placement="bottom"
              content={
                <span>
                  The workflow stages to count as 'in progress'.
                  <br />
                  Time spent in these stages is counted towards the cycle time,
                  and time spent in other stages is counted as 'wait time'.
                </span>
              }
            >
              {" "}
              <a href="#">
                <QuestionCircleOutlined style={{ fontSize: 13 }} />
              </a>{" "}
            </Popover>
            <Popconfirm
              title="Select story stages"
              icon={null}
              placement="bottom"
              description={
                <WorkflowStagesTable
                  workflowStages={project?.workflowScheme.stories.stages}
                  selectedStages={selectedStoryStages}
                  onSelectionChanged={onStoryStagesChanged}
                />
              }
            >
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                {selectedStoryStages.join(", ")}
              </Button>
            </Popconfirm>
          </span>

          <span>&middot;</span>

          <span>
            <Typography.Text type="secondary">Epic policy: </Typography.Text>
            <Dropdown
              menu={{
                items: epicPolicyItems,
                onClick: (e) => onEpicCycleTimePolicyTypeChanged(e.key),
              }}
              trigger={["click"]}
            >
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                {epicCycleTimePolicyType}
              </Button>
            </Dropdown>
          </span>

          {epicCycleTimePolicyType === EpicCycleTimePolicyType.Derived ? (
            <span>
              <Typography.Text type="secondary">
                Completed issues:{" "}
              </Typography.Text>
              <Popconfirm
                title="Completed issues filter"
                icon={null}
                description={
                  <div style={{ width: 480 }}>
                    <EditFilterForm
                      filter={cycleTimePolicy.epics}
                      resolutions={project.resolutions}
                      labels={project.labels}
                      components={project.components}
                      issueTypes={project.issueTypes}
                      setFilter={onFilterChanged}
                      showDateSelector={false}
                      showAssigneesFilter={false}
                      showHierarchyFilter={false}
                      showResolutionFilter={true}
                      showStatusFilter={false}
                      labelColSpan={6}
                      wrapperColSpan={18}
                    />
                  </div>
                }
              >
                <Button
                  size="small"
                  type="dashed"
                  icon={<CaretDownOutlined />}
                  iconPosition="end"
                >
                  {summariseFilter(cycleTimePolicy.epics)}
                </Button>
              </Popconfirm>
            </span>
          ) : (
            <span>
              <Typography.Text type="secondary">
                Selected stages
              </Typography.Text>
              <Popover
                placement="bottom"
                content={
                  <span>
                    The workflow stages to count as 'in progress'.
                    <br />
                    Time spent in these stages is counted towards the cycle
                    time, and time spent in other stages is counted as 'wait
                    time'.
                  </span>
                }
              >
                {" "}
                <a href="#">
                  <QuestionCircleOutlined style={{ fontSize: 13 }} />
                </a>{" "}
              </Popover>
              <Popconfirm
                title="Select epic stages"
                icon={null}
                placement="bottom"
                description={
                  <WorkflowStagesTable
                    workflowStages={project?.workflowScheme.epics.stages}
                    selectedStages={selectedEpicStages}
                    onSelectionChanged={onEpicStagesChanged}
                  />
                }
              >
                <Button
                  size="small"
                  type="dashed"
                  icon={<CaretDownOutlined />}
                  iconPosition="end"
                >
                  {selectedEpicStages?.join(", ")}
                </Button>
              </Popconfirm>
            </span>
          )}
        </Space>
      </Space>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <StoryPolicyForm />
        </Col>
        <Col span={12}>
          <EpicPolicyForm />
        </Col>
      </Row>
    </>
  );
};

const buildDefaultStatusesPolicy = (
  project: Project,
  hierarchyLevel: keyof WorkflowScheme,
): StatusCycleTimePolicy => {
  const statuses: TransitionStatus[] = flat(
    project.workflowScheme[hierarchyLevel].stages
      .filter((stage) => stage.selectByDefault)
      .map((stage) => stage.statuses),
  );
  const policy: StatusCycleTimePolicy = {
    statuses: statuses.map((status) => status.name),
  };
  return policy;
};
