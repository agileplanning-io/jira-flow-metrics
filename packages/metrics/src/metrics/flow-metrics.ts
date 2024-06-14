import { CycleTimePolicy, HierarchyLevel, Issue } from "../types";
import { filterIssues } from "../util";
import { getStatusFlowMetrics } from "./policies/status-flow-metrics";
import { getComputedFlowMetrics } from "./policies/computed-flow-metrics";
import { pipe } from "remeda";

export const getFlowMetrics = (
  issues: Issue[],
  policy: CycleTimePolicy,
  now: Date = new Date(),
): Issue[] => {
  const [stories, epics] = pipe(
    issues,
    partitionByHierarchyLevel,
    computeStoryMetrics(policy),
    filterStories(policy),
    checkEpicInclusion,
    computeEpicMetrics(policy, now),
  );

  return [...epics, ...stories];
};

type PartitionedIssues = [Issue[], Issue[]];

const partitionByHierarchyLevel = (issues: Issue[]): PartitionedIssues => {
  const stories = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Story,
  );

  const epics = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
  );

  return [stories, epics];
};

const computeStoryMetrics = (policy: CycleTimePolicy) => {
  const { includeWaitTime, statuses } = policy.stories;
  return ([stories, epics]: PartitionedIssues): PartitionedIssues => [
    stories.map((story) => {
      const metrics = getStatusFlowMetrics(story, includeWaitTime, statuses);
      return {
        ...story,
        metrics,
      };
    }),
    epics,
  ];
};

const filterStories =
  (policy: CycleTimePolicy) =>
  ([stories, epics]: PartitionedIssues): PartitionedIssues => {
    return [
      policy.epics.type === "computed"
        ? filterIssues(stories, policy.epics)
        : stories,
      epics,
    ];
  };

const checkEpicInclusion = ([
  stories,
  epics,
]: PartitionedIssues): PartitionedIssues => {
  const epicKeys = new Set(epics.map((epic) => epic.key));
  const includedStoryKeys = new Set(
    stories
      .filter((story) => story.parentKey && epicKeys.has(story.parentKey))
      .map((story) => story.key),
  );

  return [
    stories.map((story) => {
      if (includedStoryKeys.has(story.key)) {
        const metrics = { ...story.metrics, includedInEpic: true };
        return { ...story, metrics };
      }

      return story;
    }),
    epics,
  ];
};

const computeEpicMetrics = (policy: CycleTimePolicy, now: Date) => {
  return ([stories, epics]: PartitionedIssues): PartitionedIssues => [
    stories,
    epics.map((epic) => {
      const metrics =
        policy.epics.type === "computed"
          ? getComputedFlowMetrics(epic, stories, now)
          : getStatusFlowMetrics(
              epic,
              policy.epics.includeWaitTime,
              policy.epics.statuses,
            );
      return {
        ...epic,
        metrics,
      };
    }),
  ];
};
