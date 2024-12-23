import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { getSelectedStages } from "@data/workflows";
import { getHeaderOptions } from "./header-options";
import {
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
} from "@agileplanning-io/flow-metrics";
import {
  QuestionCircleOutlined,
  CaretDownOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { MenuProps, Space, Typography, Popover, Dropdown, Button } from "antd";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  const selectedStoryStages = getSelectedStages(
    project.workflowScheme.stories,
    cycleTimePolicy,
  );

  const selectedEpicStages = getSelectedStages(
    project.workflowScheme.epics,
    cycleTimePolicy.epics.type === EpicCycleTimePolicyType.EpicStatus
      ? cycleTimePolicy.epics
      : undefined,
  );

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "story stages",
      value: `Stages=${selectedStoryStages}`,
    },
    {
      value:
        cycleTimePolicy.type === CycleTimePolicyType.LeadTime
          ? "Lead Time"
          : "Process Time",
    },
    {
      label: "epic policy type",
      value: cycleTimePolicy.epics.type,
    },
  ];

  if (cycleTimePolicy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
    options.push({
      label: "epic stages",
      value: `Stages=${selectedEpicStages}`,
    });
  }

  if (cycleTimePolicy?.epics.type === EpicCycleTimePolicyType.Derived) {
    options.push(...getHeaderOptions(cycleTimePolicy.epics));
  }

  const policyItems: MenuProps["items"] = [
    { label: "Process Time", key: "ProcessTime" },
    { label: "Lead Time", key: "LeadTime" },
  ];

  const epicPolicyItems: MenuProps["items"] = [
    { label: "Status", key: "Status" },
    { label: "Derived", key: "Derived" },
  ];

  const saveItems: MenuProps["items"] = [
    { label: "Save as...", key: "Status" },
    { label: "My saved filter", key: "Derived" },
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
            <Dropdown menu={{ items: policyItems }}>
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                Process Time
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
            <Button
              size="small"
              type="dashed"
              icon={<CaretDownOutlined />}
              iconPosition="end"
            >
              In Progress, In Staging
            </Button>
          </span>
          <span>&middot;</span>
          <span>
            <Typography.Text type="secondary">Epic policy: </Typography.Text>
            <Dropdown menu={{ items: epicPolicyItems }} trigger={["click"]}>
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                Derived
              </Button>
            </Dropdown>
          </span>
          <span>
            <Typography.Text type="secondary">
              Completed issues:{" "}
            </Typography.Text>
            <Button
              size="small"
              type="dashed"
              icon={<CaretDownOutlined />}
              iconPosition="end"
            >
              Resolution=Done, IssueType!=Technical Debt
            </Button>
          </span>
          <Space.Compact>
            <Dropdown menu={{ items: saveItems }}>
              <Button
                size="small"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                <SaveOutlined />
              </Button>
            </Dropdown>
          </Space.Compact>
        </Space>

        {/* <Space
          direction="horizontal"
          style={{
            // background: "rgba(0, 0, 0, 0.02)",
            width: "100%",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <span>
            <Typography.Text type="secondary">
              Cycle time policy:{" "}
            </Typography.Text>
            <Dropdown menu={{ items: policyItems }} trigger={["click"]}>
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                Process Time
              </Button>
            </Dropdown>
          </span>
          <span>
            <Typography.Text type="secondary">
              Selected stages:{" "}
            </Typography.Text>
            <Button
              size="small"
              type="dashed"
              icon={<CaretDownOutlined />}
              iconPosition="end"
            >
              In Progress, In Staging
            </Button>
          </span>
          <span>&middot;</span>
          <span>
            <Typography.Text type="secondary">Epic policy: </Typography.Text>
            <Dropdown menu={{ items: epicPolicyItems }} trigger={["click"]}>
              <Button
                size="small"
                type="dashed"
                icon={<CaretDownOutlined />}
                iconPosition="end"
              >
                Status
              </Button>
            </Dropdown>
          </span>
          <span>
            <Typography.Text type="secondary">
              Selected stages:{" "}
            </Typography.Text>
            <Button
              size="small"
              type="dashed"
              icon={<CaretDownOutlined />}
              iconPosition="end"
            >
              In Progress, In Staging
            </Button>
          </span>
        </Space> */}
      </Space>
      {/* <ExpandableOptions
        header={{
          title: "Cycle Time Policy",
          options,
        }}
      > */}
      <EditCycleTimePolicyForm
        project={project}
        cycleTimePolicy={cycleTimePolicy}
        setCycleTimePolicy={setCycleTimePolicy}
      />
      {/* </ExpandableOptions> */}
    </>
  );
};
