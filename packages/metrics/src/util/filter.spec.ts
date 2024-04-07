import { buildIssue } from "../fixtures/issue-factory";
import { HierarchyLevel } from "../types";
import { FilterType, filterIssues } from "./filter";

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

  it("filters by issueType", () => {
    const filteredIssues = filterIssues([story, bug], {
      issueTypes: ["Bug"],
    });

    expect(filteredIssues).toEqual([bug]);
  });

  describe("label filters", () => {
    const labelledStory = buildIssue({ labels: ["my-label"] });

    it("filters the included labels when labelFilterType = include", () => {
      const filteredIssues = filterIssues([story, labelledStory], {
        labels: ["my-label"],
        labelFilterType: FilterType.Include,
      });

      expect(filteredIssues).toEqual([labelledStory]);
    });

    it("omits the excluded labels when labelFilterType = excluded", () => {
      const filteredIssues = filterIssues([story, labelledStory], {
        labels: ["my-label"],
        labelFilterType: FilterType.Exclude,
      });

      expect(filteredIssues).toEqual([story]);
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
        components: ["API"],
        statuses: ["Done"],
      });

      expect(filteredIssues).toEqual([issues[0]]);
    });
  });
});
