import { Version3Client } from "jira.js";
import { getAllPages } from "../jira/page-utils";
import { filter, isTruthy } from "remeda";
import { Field, Issue, StatusCategory } from "@agileplanning-io/flow-metrics";
import { StatusBuilder } from "./status-builder";
import { JiraIssueBuilder } from "./issue_builder";

export const searchIssues = async (
  client: Version3Client,
  jql: string,
  host: string,
) => {
  const [fields, jiraStatuses] = await Promise.all([
    getFields(client),
    getStatuses(client),
  ]);

  const statusBuilder = new StatusBuilder(jiraStatuses);

  const builder = new JiraIssueBuilder(fields, statusBuilder, host);

  const issuePages = await getAllPages((startAt) =>
    client.issueSearch.searchForIssuesUsingJqlPost({
      jql,
      expand: ["changelog"],
      fields: builder.getRequiredFields(),
      startAt,
    }),
  );

  return issuePages.reduce<Issue[]>((issues, page) => {
    if (!page.issues) {
      return issues;
    }

    const pageIssues = page.issues.map((issue) => builder.build(issue));

    return [...issues, ...pageIssues];
  }, []);
};

export const getFields = async (client: Version3Client): Promise<Field[]> => {
  const jiraFields = await client.issueFields.getFields();
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

export const getStatuses = async (client: Version3Client) => {
  const jiraStatuses = await client.workflowStatuses.getStatuses();
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
