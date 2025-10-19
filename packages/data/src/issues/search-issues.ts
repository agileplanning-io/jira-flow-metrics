import { getAllPages } from "../jira/page-utils";
import { filter, isTruthy } from "remeda";
import {
  Field,
  Issue,
  StatusCategory,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { StatusBuilder } from "./status-builder";
import { JiraIssueBuilder } from "./issue_builder";
import { JiraClient } from "../jira";

export type SearchIssuesResult = {
  issues: Issue[];
  canonicalStatuses: TransitionStatus[];
};

export const searchIssues = async (
  client: JiraClient,
  jql: string,
  host: string,
): Promise<SearchIssuesResult> => {
  const [fields, jiraStatuses] = await Promise.all([
    getFields(client),
    getStatuses(client),
  ]);

  const statusBuilder = new StatusBuilder(jiraStatuses);

  const builder = new JiraIssueBuilder(fields, statusBuilder, host);

  // const issuePages = await getAllPages((startAt) =>
  //   client.searchIssues({
  //     jql,
  //     fields: builder.getRequiredFields(),
  //     startAt,
  //   }),
  // );

  const issuePages = await client.searchIssuesNew({ jql, fields: [] });

  console.info(issuePages);

  // const issues = issuePages.reduce<Issue[]>((issues, page) => {
  //   if (!page.issues) {
  //     return issues;
  //   }

  //   const pageIssues = page.issues.map((issue) => builder.build(issue));

  //   return [...issues, ...pageIssues];
  // }, []);

  const issues: Issue[] = [];

  const canonicalStatuses = statusBuilder.getStatuses();

  return { issues, canonicalStatuses };
};

export const getFields = async (client: JiraClient): Promise<Field[]> => {
  const jiraFields = await client.getFields();
  return filter(
    jiraFields.map((field) => {
      if (field.id === undefined) {
        console.warn(`Missing id for field ${JSON.stringify(field)}`);
        return null;
      }

      return {
        jiraId: field.id,
        name: field.name,
      };
    }),
    isTruthy,
  );
};

export const getStatuses = async (client: JiraClient) => {
  const jiraStatuses = await client.getStatuses();
  return filter(
    jiraStatuses.map((status) => {
      if (status.id === undefined) {
        console.warn(`Missing id for status ${JSON.stringify(status)}`);
        return null;
      }

      const category = status.statusCategory?.name as StatusCategory;

      return {
        jiraId: status.id,
        name: status.name ?? `Unknown Status (${status.id})`,
        category,
      };
    }),
    isTruthy,
  );
};
