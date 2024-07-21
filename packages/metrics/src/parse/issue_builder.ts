import { Version3Models } from "jira.js";
import assert from "node:assert";
import { compact } from "remeda";
import {
  Field,
  HierarchyLevel,
  Issue,
  StatusCategory,
  Transition,
} from "../issues";
import { compareAsc } from "date-fns";
import { StatusBuilder } from "./status-builder";
import { getDifferenceInDays } from "@agileplanning-io/flow-lib";

export type TransitionContext = Omit<Transition, "timeInStatus" | "until">;

export class JiraIssueBuilder {
  private readonly epicLinkFieldId?: string;
  private readonly parentFieldId?: string;

  constructor(
    fields: Field[],
    private readonly statusBuilder: StatusBuilder,
    private readonly host: string,
  ) {
    this.epicLinkFieldId = fields.find((field) => field.name === "Epic Link")
      ?.jiraId;

    this.parentFieldId = fields.find((field) => field.name === "Parent")
      ?.jiraId;
  }

  getRequiredFields(): string[] {
    return compact([
      "key",
      "summary",
      "issuetype",
      "status",
      "resolution",
      "created",
      "labels",
      "components",
      "assignee",
      this.epicLinkFieldId,
      this.parentFieldId,
    ]);
  }

  build(json: Version3Models.Issue): Issue {
    const key = json.key;
    const status = json.fields.status.name ?? "Unknown";
    const statusCategory = json.fields.status.statusCategory
      ?.name as StatusCategory;
    const issueType = json.fields.issuetype?.name;
    const resolution = json.fields.resolution?.name;
    const assignee = json.fields.assignee?.displayName;
    const created = new Date(json.fields.created);
    const hierarchyLevel =
      issueType === "Epic" ? HierarchyLevel.Epic : HierarchyLevel.Story;
    const labels = json.fields.labels;
    const components = json.fields.components.map(
      (component) => component.name ?? "Unknown",
    );

    if (!statusCategory) {
      throw new Error(`Status category for issue ${json.key} is undefined`);
    }

    const transitions = this.buildTransitions(
      json,
      created,
      status,
      statusCategory,
    );

    const epicKey = this.epicLinkFieldId
      ? json["fields"][this.epicLinkFieldId]
      : undefined;
    const parentKey = this.parentFieldId
      ? json["fields"][this.parentFieldId]?.key
      : undefined;

    const issue: Issue = {
      key,
      externalUrl: `https://${this.host}/browse/${key}`,
      summary: json.fields.summary,
      issueType,
      resolution,
      hierarchyLevel,
      status,
      statusCategory,
      assignee,
      created,
      parentKey: epicKey ?? parentKey,
      transitions,
      labels,
      components,
      metrics: {},
    };
    return issue;
  }

  private buildTransitions(
    json: Version3Models.Issue,
    created: Date,
    status: string,
    statusCategory: StatusCategory,
  ): Transition[] {
    const histories = json.changelog?.histories ?? [];
    const transitions: TransitionContext[] = compact(
      histories.map((event) => {
        const statusChange = event.items?.find(
          (item) => item.field == "status",
        );
        if (!statusChange) {
          return null;
        }

        assert(statusChange.from);
        assert(statusChange.fromString);
        assert(statusChange.to);
        assert(statusChange.toString);

        const fromStatus = this.statusBuilder.getStatus(
          statusChange.from,
          statusChange.fromString,
        );

        const toStatus = this.statusBuilder.getStatus(
          statusChange.to,
          statusChange.toString,
        );

        const transition: TransitionContext = {
          date: new Date(Date.parse(event.created ?? "")),
          fromStatus,
          toStatus,
        };

        return transition;
      }),
    );

    return buildTransitions(transitions, created, status, statusCategory);
  }
}

export const buildTransitions = (
  transitions: TransitionContext[],
  created: Date,
  status: string,
  statusCategory: StatusCategory,
  now: Date = new Date(),
): Transition[] => {
  const sortedTransitions = transitions.sort((t1, t2) =>
    compareAsc(t1.date, t2.date),
  );

  const createdTransition: TransitionContext =
    sortedTransitions.length > 0
      ? {
          fromStatus: {
            name: "Created",
            category: StatusCategory.ToDo,
          },
          date: created,
          toStatus: sortedTransitions[0].fromStatus,
        }
      : {
          fromStatus: {
            name: "Created",
            category: StatusCategory.ToDo,
          },
          date: created,
          toStatus: {
            name: status,
            category: statusCategory,
          },
        };

  return [createdTransition, ...sortedTransitions].map(
    (transition, index, transitions): Transition => {
      const nextTransitionDate =
        index < transitions.length - 1 ? transitions[index + 1].date : now;
      const timeInStatus = getDifferenceInDays(
        nextTransitionDate,
        transition.date,
      );
      return {
        ...transition,
        timeInStatus,
        until: nextTransitionDate,
      };
    },
  );
};
