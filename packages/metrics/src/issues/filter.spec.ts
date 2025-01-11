import { clone } from "remeda";
import { buildCompletedIssue, buildIssue } from "../fixtures/issue-factory";
import { HierarchyLevel } from "../issues";
import {
  DateFilterType,
  FilterType,
  FilterUseCase,
  IssueAttributesFilter,
  filterIssues,
  isAttributesFilterEqual,
} from "./filter";

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

  describe("date filters", () => {
    const issue1Started = new Date("2024-03-01");
    const issue1Completed = new Date("2024-03-03");
    const issue2Started = new Date("2024-02-02");
    const issue2Completed = new Date("2024-03-04");
    const issue3Started = new Date("2024-03-03");
    const issue3Completed = new Date("2024-03-05");
    const issue4Completed = new Date("2024-03-06");

    const issue1 = buildCompletedIssue({
      metrics: {
        started: issue1Started,
        completed: issue1Completed,
        cycleTime: 1,
      },
    });
    const issue2 = buildCompletedIssue({
      metrics: {
        started: issue2Started,
        completed: issue2Completed,
        cycleTime: 1,
      },
    });
    const issue3 = buildCompletedIssue({
      metrics: {
        started: issue3Started,
        completed: issue3Completed,
        cycleTime: 1,
      },
    });
    const issue4 = buildCompletedIssue({
      metrics: {
        completed: issue4Completed,
        cycleTime: 1,
      },
    });
    const issues = [issue1, issue2, issue3, issue4];

    describe("when the filter type is 'completed'", () => {
      const interval = { start: issue1Started, end: issue2Completed };
      const filterType = DateFilterType.Completed;

      it("filters issues completed within the given interval", () => {
        const filteredIssues = filterIssues(issues, {
          dates: { filterType, interval },
        });
        expect(filteredIssues).toEqual([issue1, issue2]);
      });
    });

    describe("when the filter type is 'overlaps'", () => {
      it("filters issues which overlap the given interval", () => {
        const filteredIssues = filterIssues(issues, {
          dates: {
            filterType: DateFilterType.Overlaps,
            interval: { start: issue1Started, end: issue2Completed },
          },
        });
        expect(filteredIssues).toEqual([issue1, issue2, issue3]);
      });
    });
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

describe("isAttributesFilterEqual", () => {
  const filter1: IssueAttributesFilter = {
    resolutions: {
      type: FilterType.Include,
      values: ["Done"],
    },
  };

  it("returns true when the filters are identical", () => {
    expect(isAttributesFilterEqual(filter1, clone(filter1))).toBe(true);
  });

  it("returns true when the filters are sementically identical", () => {
    const filter2: IssueAttributesFilter = {
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
      labels: {
        type: FilterType.Include,
        values: [],
      },
      issueTypes: {
        type: FilterType.Exclude,
        values: [],
      },
    };

    expect(isAttributesFilterEqual(filter1, filter2)).toBe(true);
  });

  it("returns false when the filters are semantically distinct", () => {
    const filter2: IssueAttributesFilter = {
      resolutions: {
        type: FilterType.Include,
        values: ["Won't Do"],
      },
    };

    const filter3: IssueAttributesFilter = {
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
      labels: {
        type: FilterType.Exclude,
        values: ["Outlier"],
      },
    };

    expect(isAttributesFilterEqual(filter1, filter2)).toBe(false);
    expect(isAttributesFilterEqual(filter1, filter3)).toBe(false);
  });
});
