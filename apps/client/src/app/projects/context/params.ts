import {
  ComputedCycleTimePolicy,
  CycleTimePolicy,
  LabelFilterType,
  StatusCycleTimePolicy,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { SearchParamsBuilder } from "@lib/search-params-builder";
import { SetURLSearchParams } from "react-router-dom";

const parseEpicPolicyType = (
  builder: SearchParamsBuilder,
  project: Project,
): CycleTimePolicy["epics"]["type"] => {
  if (!builder.get("epicPolicyType")) {
    builder.set("epicPolicyType", project.defaultCycleTimePolicy.epics.type);
  }

  return builder.get("epicPolicyType") as CycleTimePolicy["epics"]["type"];
};

const parseEpicStatusPolicy = (
  builder: SearchParamsBuilder,
  project: Project,
): StatusCycleTimePolicy => {
  if (!builder.getAll("epicPolicyStatuses")) {
    builder.setAll(
      "epicPolicyStatuses",
      project.defaultCycleTimePolicy.epics.type === "status"
        ? project.defaultCycleTimePolicy.epics.statuses
        : undefined,
    );
  }

  const statuses = builder.getAll("epicPolicyStatuses") ?? [];

  if (!builder.get("epicPolicyIncludeWaitTime")) {
    builder.set(
      "epicPolicyIncludeWaitTime",
      project.defaultCycleTimePolicy.epics.type === "status"
        ? project.defaultCycleTimePolicy.epics.includeWaitTime
        : false,
    );
  }

  const includeWaitTime = builder.get("epicPolicyIncludeWaitTime") === "true";

  return {
    type: "status",
    statuses,
    includeWaitTime,
  };
};

const parseEpicComputedPolicy = (
  builder: SearchParamsBuilder,
  project: Project,
): ComputedCycleTimePolicy => {
  if (!builder.getAll("epicPolicyLabels")) {
    builder.setAll(
      "epicPolicyLabels",
      project.defaultCycleTimePolicy.epics.type === "computed"
        ? project.defaultCycleTimePolicy.epics.labelsFilter?.labels
        : undefined,
    );
  }

  const labels = builder.getAll("epicPolicyLabels") ?? [];

  if (!builder.get("epicPolicyLabelFilterType")) {
    builder.set(
      "epicPolicyLabelFilterType",
      project.defaultCycleTimePolicy.epics.type === "computed"
        ? project.defaultCycleTimePolicy.epics.labelsFilter?.labelFilterType
        : LabelFilterType.Include,
    );
  }

  const labelFilterType = builder.get(
    "epicPolicyLabelFilterType",
  ) as LabelFilterType;

  return {
    type: "computed",
    labelsFilter: {
      labels,
      labelFilterType,
    },
  };
};

const parseEpicPolicy = (
  builder: SearchParamsBuilder,
  project: Project,
): CycleTimePolicy["epics"] => {
  const epicPolicyType = parseEpicPolicyType(builder, project);

  const epicPolicy =
    epicPolicyType === "status"
      ? parseEpicStatusPolicy(builder, project)
      : parseEpicComputedPolicy(builder, project);

  return epicPolicy;
};

const parseStoryPolicy = (
  builder: SearchParamsBuilder,
  project: Project,
): StatusCycleTimePolicy => {
  if (!builder.getAll("storyPolicyStatuses")) {
    builder.setAll(
      "storyPolicyStatuses",
      project.defaultCycleTimePolicy.stories.statuses,
    );
  }

  const statuses = builder.getAll("storyPolicyStatuses") ?? [];

  if (!builder.get("storyPolicyIncludeWaitTime")) {
    builder.set(
      "storyPolicyIncludeWaitTime",
      project.defaultCycleTimePolicy.stories.includeWaitTime,
    );
  }

  const includeWaitTime = builder.get("storyPolicyIncludeWaitTime") === "true";

  return {
    type: "status",
    statuses,
    includeWaitTime,
  };
};

export const parseCycleTimePolicy = (
  searchParams: URLSearchParams,
  project: Project,
  setSearchParams: SetURLSearchParams,
): CycleTimePolicy => {
  const builder = new SearchParamsBuilder(searchParams);

  const epicPolicy = parseEpicPolicy(builder, project);
  const storyPolicy = parseStoryPolicy(builder, project);
  const cycleTimePolicy: CycleTimePolicy = {
    stories: storyPolicy,
    epics: epicPolicy,
  };

  if (builder.getChanged()) {
    setSearchParams(builder.getParams());
  }

  return cycleTimePolicy;
};

export const toParams = (prev: URLSearchParams, policy: CycleTimePolicy) => {
  const builder = new SearchParamsBuilder(prev);

  builder
    .set("storyPolicyIncludeWaitTime", policy.stories.includeWaitTime)
    .setAll("storyPolicyStatuses", policy.stories.statuses);

  builder.set("epicPolicyType", policy.epics.type);
  if (policy.epics.type === "status") {
    builder
      .set("epicPolicyIncludeWaitTime", policy.epics.includeWaitTime)
      .setAll("epicPolicyStatuses", policy.epics.statuses);
  } else {
    builder
      .setAll("epicPolicyLabels", policy.epics.labelsFilter?.labels)
      .set(
        "epicPolicyLabelFilterType",
        policy.epics.labelsFilter?.labelFilterType,
      );
  }

  return builder.getParams();
};
