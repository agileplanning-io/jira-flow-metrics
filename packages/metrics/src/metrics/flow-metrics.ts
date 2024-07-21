import { HierarchyLevel, Issue } from "../issues";
import { filterIssues } from "../issues";
import { getStatusFlowMetrics } from "./policies/status-flow-metrics";
import { getComputedFlowMetrics } from "./policies/computed-flow-metrics";
import { pipe } from "remeda";
import { CycleTimePolicy } from "./policies/cycle-time-policy";

export const getFlowMetrics = (
  issues: Issue[],
  policy: CycleTimePolicy,
): Issue[] => {
  const [stories, epics] = pipe(
    issues,
    partitionByHierarchyLevel,
    computeStoryMetrics(policy),
    filterStories(policy),
    checkEpicInclusion,
    computeEpicMetrics(policy),
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
  return ([stories, epics]: PartitionedIssues): PartitionedIssues => [
    stories.map((story) => {
      const metrics = getStatusFlowMetrics(story, policy.stories);
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

const computeEpicMetrics = (policy: CycleTimePolicy) => {
  return ([stories, epics]: PartitionedIssues): PartitionedIssues => [
    stories,
    epics.map((epic) => {
      const metrics =
        policy.epics.type === "computed"
          ? getComputedFlowMetrics(epic, stories, policy)
          : getStatusFlowMetrics(epic, policy.epics);
      return {
        ...epic,
        metrics,
      };
    }),
  ];
};
