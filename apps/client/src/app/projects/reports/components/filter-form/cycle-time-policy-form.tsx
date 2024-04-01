import { LabelFilterType } from "@agileplanning-io/flow-metrics";
import { Tag } from "antd";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy, issues } =
    useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  // TODO: define API cycle time policies in terms of stages and remove this duplication with
  // EditCycleTimePolicyForm
  const selectedStoryStages = project?.workflow.stories.stages
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          cycleTimePolicy?.stories.statuses?.some(
            (projectStatus) => projectStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);

  const selectedEpicStages = project?.workflow.epics.stages
    .filter((stage) =>
      stage.statuses.every((status) => {
        if (cycleTimePolicy?.epics.type === "status") {
          if (cycleTimePolicy.epics.statuses?.length) {
            return cycleTimePolicy.epics.statuses?.some(
              (projectStatus) => projectStatus === status.name,
            );
          } else {
            return stage.selectByDefault;
          }
        }
        return false;
      }),
    )
    .map((stage) => stage.name);

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "story stages",
      value: selectedStoryStages
        ? `Stages=${selectedStoryStages}`
        : "StatusCategory=In Progress",
    },
    {
      value: `${
        cycleTimePolicy?.stories.includeWaitTime ? "Include" : "Exclude"
      } story wait time`,
    },
  ];

  if (cycleTimePolicy.epics.type === "status") {
    options.push(
      ...[
        {
          label: "epic stages",
          value: selectedEpicStages
            ? `Stages=${selectedEpicStages}`
            : "StatusCategory=In Progress",
        },
        {
          value: `${
            cycleTimePolicy.epics.includeWaitTime ? "Include" : "Exclude"
          } epic wait time`,
        },
      ],
    );
  }

  if (cycleTimePolicy?.epics.type === "computed") {
    options.push({
      label:
        cycleTimePolicy?.epics.labelsFilter?.labelFilterType ===
        LabelFilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: cycleTimePolicy?.epics.labelsFilter?.labels?.join(),
    });
  }

  return (
    <ExpandableOptions
      header={{
        title: "Cycle Time Policy",
        options,
      }}
      extra={issues ? <Tag>{issues.length} issues</Tag> : null}
    >
      <EditCycleTimePolicyForm
        project={project}
        cycleTimePolicy={cycleTimePolicy}
        setCycleTimePolicy={setCycleTimePolicy}
      />
    </ExpandableOptions>
  );
};
