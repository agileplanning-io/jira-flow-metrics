import {
  Dropdown,
  DropdownItemType,
  FormControl,
  HelpIcon,
  Popdown,
  WorkflowStagesTable,
} from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  FilterType,
  IssueAttributesFilter,
  SavedPolicy,
  StatusCycleTimePolicy,
  TransitionStatus,
  ValuesFilter,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import { Space, Typography } from "antd";
import { clone, compact, flat } from "remeda";
import { FC, Key, ReactNode, useMemo } from "react";
import { EditFilterForm } from "@app/projects/reports/components/filter-form/edit-filter-form";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";
import { ellipsize } from "@agileplanning-io/flow-lib";
import {
  PoliciesDropdown,
  SavePolicyMutationResult,
  DeletePolicyMutationResult,
} from "@agileplanning-io/flow-components";

type EditCycleTimePolicyForm = {
  savedPolicyId?: string;
  setSavedPolicyId: (policyId?: string) => void;
  savedPolicies?: SavedPolicy[];
  project: Project;
  cycleTimePolicy: CycleTimePolicy;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
  onMakeDefaultClicked: (policy: SavedPolicy) => void;
  onSaveClicked: (policy: SavedPolicy) => void;
  saveCycleTimePolicy: SavePolicyMutationResult;
  deleteCycleTimePolicy: DeletePolicyMutationResult;
};

export const EditCycleTimePolicyForm: FC<EditCycleTimePolicyForm> = ({
  savedPolicyId,
  setSavedPolicyId,
  savedPolicies,
  project,
  cycleTimePolicy,
  setCycleTimePolicy,
  onMakeDefaultClicked,
  onSaveClicked,
  saveCycleTimePolicy,
  deleteCycleTimePolicy,
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

  const summariseFilter = (filter: IssueAttributesFilter): ReactNode => {
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

    if (compact(summary).length === 0) {
      return (
        <Typography.Text type="secondary">No filter applied</Typography.Text>
      );
    }

    return ellipsize(compact(summary).join(", "), 48);
  };

  const policyItems: DropdownItemType<CycleTimePolicyType>[] = [
    { label: "Process Time", key: CycleTimePolicyType.ProcessTime },
    { label: "Lead Time", key: CycleTimePolicyType.LeadTime },
  ];

  const epicPolicyItems: DropdownItemType<EpicCycleTimePolicyType>[] = [
    { label: "Status", key: EpicCycleTimePolicyType.EpicStatus },
    { label: "Derived", key: EpicCycleTimePolicyType.Derived },
  ];

  return (
    <Space direction="vertical" style={{ marginBottom: 8, width: "100%" }}>
      <Space
        direction="horizontal"
        style={{
          // background: "rgba(0, 0, 0, 0.02)",
          width: "100%",
          padding: 8,
          borderRadius: 8,
        }}
      >
        <FormControl
          label={
            <>
              Cycle time policy{" "}
              <HelpIcon
                content={
                  <span>
                    How to calculate cycle times.
                    <br />
                    <Typography.Text code>Process Time</Typography.Text> is the
                    amount of time the issue spent in the selected workflow
                    stages.
                    <br />
                    <Typography.Text code>Lead Time</Typography.Text> is the
                    total time to completion (including wait time).
                  </span>
                }
              />
            </>
          }
        >
          <Dropdown
            items={policyItems}
            selectedKey={cycleTimePolicyType}
            onItemSelected={onStoryCycleTimePolicyTypeChanged}
          />
        </FormControl>

        <FormControl
          label={
            <>
              Selected stages{" "}
              <HelpIcon
                content={
                  <span>
                    The workflow stages to count as 'in progress'.
                    <br />
                    Time spent in these stages is counted towards the cycle
                    time, and time spent in other stages is counted as 'wait
                    time'.
                  </span>
                }
              />
            </>
          }
        >
          <Popdown
            title="Select story stages"
            value={selectedStoryStages}
            renderLabel={(selectedStoryStages) =>
              selectedStoryStages.join(", ")
            }
            onValueChanged={(stages) => onStoryStagesChanged(stages)}
          >
            {(value, setValue) => (
              <WorkflowStagesTable
                workflowStages={project?.workflowScheme.stories.stages}
                selectedStages={value}
                onSelectionChanged={(stages) => setValue(stages as string[])}
              />
            )}
          </Popdown>
        </FormControl>

        <span>&middot;</span>

        <FormControl label="Epic policy">
          <Dropdown
            items={epicPolicyItems}
            selectedKey={epicCycleTimePolicyType}
            onItemSelected={onEpicCycleTimePolicyTypeChanged}
          />
        </FormControl>

        {epicCycleTimePolicyType === EpicCycleTimePolicyType.Derived ? (
          <FormControl label="Completed issues">
            <Popdown
              renderLabel={summariseFilter}
              value={cycleTimePolicy.epics as IssueAttributesFilter}
              title="Completed issues filter"
              onValueChanged={onFilterChanged}
            >
              {(value, setValue) => (
                <div style={{ width: 480 }}>
                  <EditFilterForm
                    filter={value}
                    resolutions={project.resolutions}
                    labels={project.labels}
                    components={project.components}
                    issueTypes={project.issueTypes}
                    setFilter={setValue}
                    showDateSelector={false}
                    showAssigneesFilter={false}
                    showHierarchyFilter={false}
                    showResolutionFilter={true}
                    showStatusFilter={false}
                    labelColSpan={6}
                    wrapperColSpan={18}
                  />
                </div>
              )}
            </Popdown>
          </FormControl>
        ) : (
          <FormControl
            label={
              <>
                Selected stages{" "}
                <HelpIcon
                  content={
                    <span>
                      The workflow stages to count as 'in progress'.
                      <br />
                      Time spent in these stages is counted towards the cycle
                      time, and time spent in other stages is counted as 'wait
                      time'.
                    </span>
                  }
                />
              </>
            }
          >
            <Popdown
              title="Select epic stages"
              value={selectedEpicStages}
              renderLabel={(selectedEpicStages) =>
                selectedEpicStages?.join(", ")
              }
              onValueChanged={(stages) => {
                if (stages) {
                  onEpicStagesChanged(stages);
                }
              }}
            >
              {(value, setValue) => (
                <WorkflowStagesTable
                  workflowStages={project?.workflowScheme.stories.stages}
                  selectedStages={value}
                  onSelectionChanged={(stages) => setValue(stages as string[])}
                />
              )}
            </Popdown>
          </FormControl>
        )}

        {savedPolicies ? (
          <PoliciesDropdown
            savedPolicies={savedPolicies}
            savedPolicyId={savedPolicyId}
            cycleTimePolicy={cycleTimePolicy}
            saveCycleTimePolicy={saveCycleTimePolicy}
            deleteCycleTimePolicy={deleteCycleTimePolicy}
            onPolicySelected={(policy) => {
              if (policy) {
                setSavedPolicyId(policy.id);
                setCycleTimePolicy(policy.policy);
              } else {
                setSavedPolicyId(undefined);
              }
            }}
            onSaveClicked={onSaveClicked}
            onMakeDefaultClicked={onMakeDefaultClicked}
          />
        ) : null}
      </Space>
    </Space>
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
