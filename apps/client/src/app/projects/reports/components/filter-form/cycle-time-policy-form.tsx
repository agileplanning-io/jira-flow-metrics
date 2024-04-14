import { FilterType } from "@agileplanning-io/flow-metrics";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { getSelectedStages } from "@data/workflows";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  const selectedStoryStages = getSelectedStages(
    project.workflowScheme.stories,
    cycleTimePolicy?.stories,
  );

  const selectedEpicStages = getSelectedStages(
    project.workflowScheme.epics,
    cycleTimePolicy.epics.type === "status" ? cycleTimePolicy.epics : undefined,
  );

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
    {
      label: "epic policy type",
      value: cycleTimePolicy?.epics.type,
    },
  ];

  if (cycleTimePolicy.epics.type === "status") {
    options.push(
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
    );
  }

  if (cycleTimePolicy?.epics.type === "computed") {
    if (cycleTimePolicy.epics.labelsFilter?.values?.length) {
      options.push({
        label:
          cycleTimePolicy?.epics.labelsFilter?.type === FilterType.Exclude
            ? "Exclude labels"
            : "Include labels",
        value: cycleTimePolicy?.epics.labelsFilter?.values?.join(),
      });
    }

    if (cycleTimePolicy.epics.issueTypesFilter?.values?.length) {
      options.push({
        label:
          cycleTimePolicy?.epics.issueTypesFilter?.type === FilterType.Exclude
            ? "Exclude issue types"
            : "Include issue types",
        value: cycleTimePolicy?.epics.issueTypesFilter?.values?.join(),
      });
    }
  }

  return (
    <ExpandableOptions
      header={{
        title: "Cycle Time Policy",
        options,
      }}
    >
      <EditCycleTimePolicyForm
        project={project}
        cycleTimePolicy={cycleTimePolicy}
        setCycleTimePolicy={setCycleTimePolicy}
      />
    </ExpandableOptions>
  );
};
