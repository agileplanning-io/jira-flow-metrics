import {
  ClientIssueFilter,
  CycleTimePolicy,
  CycleTimePolicyType,
  DraftPolicy,
  EpicCycleTimePolicyType,
  FilterType,
  getSelectedStages,
  IssueAttributesFilter,
  SavedPolicy,
  StatusCycleTimePolicy,
  TransitionStatus,
  ValuesFilter,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Space, Typography } from "antd";
import { clone, compact, flat } from "remeda";
import { FC, Key, ReactNode, useMemo } from "react";
import { ellipsize } from "@agileplanning-io/flow-lib";
import { CurrentPolicy, PoliciesDropdown } from "./policies-dropdown";
import { Dropdown, DropdownItemType } from "../control-bars/dropdown";
import { FormControl } from "../control-bars/form-control";
import { HelpIcon } from "../control-bars/help-icon";
import { Popdown } from "../control-bars/popdown";
import { FilterOptions, EditFilterForm } from "../edit-filter-form";
import { WorkflowStagesTable } from "../workflow-stages-table";

type EditCycleTimePolicyForm = {
  currentPolicy: CurrentPolicy;
  selectCycleTimePolicy: (policyId?: string) => void;
  updateCurrentPolicy: (policy: CycleTimePolicy) => void;
  savedPolicies?: SavedPolicy[];
  filterOptions: FilterOptions;
  workflowScheme: WorkflowScheme;
  onMakeDefaultClicked: (policy: SavedPolicy) => void;
  onSaveClicked: (policy: SavedPolicy) => void;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  deleteCycleTimePolicy: (policyId: string) => Promise<void>;
};

export const EditCycleTimePolicyForm: FC<EditCycleTimePolicyForm> = ({
  currentPolicy,
  selectCycleTimePolicy,
  updateCurrentPolicy,
  savedPolicies,
  filterOptions,
  workflowScheme,
  onMakeDefaultClicked,
  onSaveClicked,
  saveCycleTimePolicy,
  deleteCycleTimePolicy,
}) => {
  const selectedStoryStages = useMemo(() => {
    return getSelectedStages(workflowScheme.stories, currentPolicy.policy);
  }, [workflowScheme, currentPolicy.policy]);

  const selectedEpicStages = useMemo(() => {
    if (
      currentPolicy.policy.epics.type !== EpicCycleTimePolicyType.EpicStatus
    ) {
      return undefined;
    }

    return getSelectedStages(workflowScheme.epics, currentPolicy.policy.epics);
  }, [workflowScheme, currentPolicy.policy]);

  const cycleTimePolicyType = currentPolicy.policy.type;
  const onStoryCycleTimePolicyTypeChanged = (type: CycleTimePolicyType) => {
    const policy = clone(currentPolicy.policy);
    if (type !== policy.type) {
      policy.type = type;
      updateCurrentPolicy(policy);
    }
  };

  const onStoryStagesChanged = (keys: Key[]) => {
    const policy = clone(currentPolicy.policy);

    const statuses: string[] = flat(
      workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)),
    );

    policy.statuses = statuses;
    updateCurrentPolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const policy = clone(currentPolicy.policy);

    if (policy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
      const statuses: string[] = flat(
        workflowScheme.epics.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)),
      );

      policy.epics.statuses = statuses;
      updateCurrentPolicy(policy);
    }
  };

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(currentPolicy.policy);
    if (policy.epics.type === EpicCycleTimePolicyType.Derived) {
      policy.epics = {
        type: EpicCycleTimePolicyType.Derived,
        ...filter,
      };
    }
    updateCurrentPolicy(policy);
  };

  const epicCycleTimePolicyType = currentPolicy.policy.epics.type;
  const onEpicCycleTimePolicyTypeChanged = (
    type: CycleTimePolicy["epics"]["type"],
  ) => {
    const policy = clone(currentPolicy.policy);
    if (type !== policy.epics.type) {
      if (type === EpicCycleTimePolicyType.EpicStatus) {
        policy.epics = {
          ...buildDefaultStatusesPolicy(workflowScheme, "epics"),
          type: EpicCycleTimePolicyType.EpicStatus,
        };
      } else {
        policy.epics = { type: EpicCycleTimePolicyType.Derived };
      }
      updateCurrentPolicy(policy);
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
                workflowStages={workflowScheme.stories.stages}
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
              value={currentPolicy.policy.epics as IssueAttributesFilter}
              title="Completed issues filter"
              onValueChanged={onFilterChanged}
            >
              {(value, setValue) => (
                <div style={{ width: 480 }}>
                  <EditFilterForm
                    filter={value}
                    filterOptions={filterOptions}
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
                  workflowStages={workflowScheme.epics.stages}
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
            currentPolicy={currentPolicy}
            saveCycleTimePolicy={saveCycleTimePolicy}
            deleteCycleTimePolicy={deleteCycleTimePolicy}
            onPolicySelected={(policy) => {
              if (policy) {
                selectCycleTimePolicy(policy.id);
              } else {
                selectCycleTimePolicy(undefined);
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
  workflowScheme: WorkflowScheme,
  hierarchyLevel: keyof WorkflowScheme,
): StatusCycleTimePolicy => {
  const statuses: TransitionStatus[] = flat(
    workflowScheme[hierarchyLevel].stages
      .filter((stage) => stage.selectByDefault)
      .map((stage) => stage.statuses),
  );
  const policy: StatusCycleTimePolicy = {
    statuses: statuses.map((status) => status.name),
  };
  return policy;
};