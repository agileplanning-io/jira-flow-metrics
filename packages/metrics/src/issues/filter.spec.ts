import { buildIssue } from "../fixtures/issue-factory";
import { HierarchyLevel } from "../issues";
import { FilterType, FilterUseCase, filterIssues } from "./filter";

describe("filterIssues", () => {
  const story = buildIssue({ hierarchyLevel: HierarchyLevel.Story });
  const epic = buildIssue({ hierarchyLevel: HierarchyLevel.Epic });
  const bug = buildIssue({ issueType: "Bug" });

  it("filters by hierarchyType", () => {
    const filteredIssues = filterIssues([story, epic], {
      hierarchyLevel: HierarchyLevel.Story,
    });

    expect(filteredIssues).toEqual([story]);
  });

  describe("issueType filters", () => {
    it("filters the included issueTypes when issueTypeFilterType = include", () => {
      const filteredIssues = filterIssues([story, bug], {
        issueTypes: {
          values: ["Story"],
          type: FilterType.Include,
        },
      });

      expect(filteredIssues).toEqual([story]);
    });

    it("omits the excluded issueTypes when issueTypeFilterType = exclude", () => {
      const filteredIssues = filterIssues([story, bug], {
        issueTypes: {
          values: ["Story"],
          type: FilterType.Exclude,
        },
      });

      expect(filteredIssues).toEqual([bug]);
    });
  });

  describe("label filters", () => {
    const labelledStory = buildIssue({ labels: ["my-label"] });

    it("filters the included labels when labelFilterType = include", () => {
      const filteredIssues = filterIssues([story, labelledStory], {
        labels: { values: ["my-label"], type: FilterType.Include },
      });

      expect(filteredIssues).toEqual([labelledStory]);
    });

    it("omits the excluded labels when labelFilterType = exclude", () => {
      const filteredIssues = filterIssues([story, labelledStory], {
        labels: { values: ["my-label"], type: FilterType.Exclude },
      });

      expect(filteredIssues).toEqual([story]);
    });
  });

  describe("component filters", () => {
    const apiStory = buildIssue({ components: ["API"] });

    it("filters the included components when componentFilterType = include", () => {
      const filteredIssues = filterIssues([story, apiStory], {
        components: {
          values: ["API"],
          type: FilterType.Include,
        },
      });

      expect(filteredIssues).toEqual([apiStory]);
    });

    it("omits the excluded labels when labelFilterType = exclude", () => {
      const filteredIssues = filterIssues([story, apiStory], {
        components: {
          values: ["API"],
          type: FilterType.Exclude,
        },
      });

      expect(filteredIssues).toEqual([story]);
    });
  });

  describe("resolution filters", () => {
    const doneStory = { ...story, resolution: "Done" };
    const duplicateStory = { ...story, resolution: "Duplicate" };

    it("includes resolutions", () => {
      const filteredIssues = filterIssues([doneStory, duplicateStory, story], {
        resolutions: {
          values: ["Done"],
          type: FilterType.Include,
        },
      });

      expect(filteredIssues).toEqual([doneStory]);
    });

    it("excludes resolutions", () => {
      const filteredIssues = filterIssues([doneStory, duplicateStory, story], {
        resolutions: {
          values: ["Done"],
          type: FilterType.Exclude,
        },
      });

      expect(filteredIssues).toEqual([duplicateStory, story]);
    });

    it("applies the resolution filter selectively in the metrics use case", () => {
      const filteredIssues = filterIssues(
        [doneStory, duplicateStory, story],
        {
          resolutions: {
            values: ["Done"],
            type: FilterType.Exclude,
          },
        },
        FilterUseCase.Metrics,
      );

      expect(filteredIssues).toEqual([duplicateStory, story]);
    });
  });

  describe("assignee filters", () => {
    const aliceStory = { ...story, assignee: "Alice" };
    const bobStory = { ...story, assignee: "Bob" };

    it("includes assignees", () => {
      const filteredIssues = filterIssues([aliceStory, bobStory], {
        assignees: {
          values: ["Alice"],
          type: FilterType.Include,
        },
      });

      expect(filteredIssues).toEqual([aliceStory]);
    });

    it("excludes assignees", () => {
      const filteredIssues = filterIssues([aliceStory, bobStory], {
        assignees: {
          values: ["Alice"],
          type: FilterType.Exclude,
        },
      });

      expect(filteredIssues).toEqual([bobStory]);
    });
  });

  describe("combined filters", () => {
    it("filters by components and status", () => {
      const issues = [
        buildIssue({ status: "Done", components: ["API"] }),
        buildIssue({ status: "In Progress", components: ["API"] }),
        buildIssue({ status: "Done", components: ["Web"] }),
      ];

      const filteredIssues = filterIssues(issues, {
        components: {
          values: ["API"],
          type: FilterType.Include,
        },
        statuses: {
          values: ["Done"],
          type: FilterType.Include,
        },
      });

      expect(filteredIssues).toEqual([issues[0]]);
    });
  });
});
