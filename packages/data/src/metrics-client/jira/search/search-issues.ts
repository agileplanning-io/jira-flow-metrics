import { chunk, filter, isNot, isNullish, isTruthy } from "remeda";
import {
  Field,
  Issue,
  StatusCategory,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { StatusBuilder } from "./status-builder";
import { JiraIssueBuilder } from "./issue_builder";
import { BulkFetchParams, JiraClient } from "../";
import { Version3Models } from "jira.js";
import { mapLimit } from "async";

export type SearchIssuesResult = {
  issues: Issue[];
  canonicalStatuses: TransitionStatus[];
};

const jqlPrefix = "jql:";
type JqlPrefix = typeof jqlPrefix;

const linearTeamPrefix = "team:";
type LinearTeamPrefix = typeof linearTeamPrefix;

export type IssueQuery =
  | `${JqlPrefix}${string}`
  | `${LinearTeamPrefix}${string}`;

export const getJql = (query: IssueQuery) => {
  if (query.startsWith(jqlPrefix)) {
    return query.slice(jqlPrefix.length);
  }

  throw new Error(`Unexpected query: ${query}`);
};

export const getLinearTeamId = (query: IssueQuery) => {
  if (query.startsWith(linearTeamPrefix)) {
    return query.slice(linearTeamPrefix.length);
  }

  throw new Error(`Unexpected query: ${query}`);
};

export const searchIssues = async (
  client: JiraClient,
  query: IssueQuery,
  host: string,
): Promise<SearchIssuesResult> => {
  const [fields, jiraStatuses] = await Promise.all([
    getFields(client),
    getStatuses(client),
  ]);

  const statusBuilder = new StatusBuilder(jiraStatuses);

  const builder = new JiraIssueBuilder(fields, statusBuilder, host);

  const issueKeys = await getIssueKeys(client, getJql(query));

  const jiraIssues = await getIssueDetails(client, {
    keys: issueKeys,
    fields: builder.getRequiredFields(),
  });

  const issues = jiraIssues.map((issue) => builder.build(issue));

  const canonicalStatuses = statusBuilder.getStatuses();

  return { issues, canonicalStatuses };
};

const getIssueKeys = async (
  client: JiraClient,
  jql: string,
): Promise<string[]> => {
  const getPage = (
    nextPageToken?: string,
  ): Promise<Version3Models.SearchAndReconcileResults> =>
    client.enhancedSearch({ jql, nextPageToken });

  const getKeys = (
    page: Version3Models.SearchAndReconcileResults,
  ): string[] => {
    return filter(
      page.issues?.map((issue) => issue.key) ?? [],
      isNot(isNullish),
    );
  };

  let page = await getPage();

  const keys: string[] = getKeys(page);

  while (page.nextPageToken) {
    page = await getPage(page.nextPageToken);
    keys.push(...getKeys(page));
  }

  return keys;
};

const getIssueDetails = async (
  client: JiraClient,
  { keys, fields }: BulkFetchParams,
) => {
  const keyChunks = chunk(keys, 100);

  const fetchIssues = async (keys: string[]) =>
    client.fetchIssues({ fields, keys });

  const results = await mapLimit(keyChunks, 5, fetchIssues);

  return results.reduce<Version3Models.Issue[]>(
    (issues, result) => issues.concat(...result.issues!),
    [],
  );
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
