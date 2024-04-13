import { mapLimit } from "async";
import { compact, range } from "remeda";
import { Injectable } from "@nestjs/common";
import {
  Field,
  Issue,
  Status,
  StatusCategory,
  JiraIssueBuilder,
} from "@agileplanning-io/flow-metrics";
import { JiraIssuesRepository } from "@usecases/projects/sync/jira-issues-repository";
import { createJiraClient } from "../client/jira-client";
import { Domain } from "@entities/domains";

export type SearchParams = {
  jql: string;
  onProgress: (pageIndex: number, total: number) => void;
  builder: JiraIssueBuilder;
};

@Injectable()
export class HttpJiraIssuesRepository extends JiraIssuesRepository {
  async getFields(domain: Domain): Promise<Field[]> {
    const client = createJiraClient(domain);
    const jiraFields = await client.issueFields.getFields();
    return compact(
      jiraFields.map((field) => {
        if (field.id === undefined) {
          console.warn(`Missing id for field ${field}`);
          return null;
        }

        return {
          jiraId: field.id,
          name: field.name,
        };
      }),
    );
  }

  async getStatuses(domain: Domain): Promise<Status[]> {
    const client = createJiraClient(domain);
    const jiraStatuses = await client.workflowStatuses.getStatuses();
    return compact(
      jiraStatuses.map((status) => {
        if (status.id === undefined) {
          console.warn(`Missing id for status ${status}`);
          return null;
        }

        const category = status.statusCategory?.name as StatusCategory;

        return {
          jiraId: status.id,
          name: status.name ?? `Unknown Status (${status.id})`,
          category,
        };
      }),
    );
  }

  async search(domain, { jql, onProgress, builder }): Promise<Issue[]> {
    const client = createJiraClient(domain);

    const searchParams = {
      jql,
      expand: ["changelog"],
      fields: builder.getRequiredFields(),
    };

    onProgress(0, 1);

    const firstPage =
      await client.issueSearch.searchForIssuesUsingJqlPost(searchParams);

    const maxResults = firstPage.maxResults;
    const total = firstPage.total;

    if (total === undefined || maxResults === undefined) {
      throw new Error(
        `Response missing fields: total=${total}, maxResults: ${maxResults}`,
      );
    }

    const pageCount = Math.ceil(total / maxResults);

    let progress = 0;
    const incrementProgress = () => {
      progress += 1;
      onProgress(progress, pageCount);
    };
    incrementProgress();

    const remainingPages = await mapLimit(
      range(1, pageCount),
      5,
      async (pageIndex: number) => {
        const page = await client.issueSearch.searchForIssuesUsingJqlPost({
          ...searchParams,
          startAt: pageIndex * maxResults,
        });
        incrementProgress();
        return page;
      },
    );

    const pages = [firstPage, ...remainingPages];
    const issues = pages.reduce<Issue[]>((issues, page) => {
      if (!page.issues) {
        return issues;
      }

      const pageIssues = page.issues.map((issue) => builder.build(issue));

      return [...issues, ...pageIssues];
    }, []);

    return issues;
  }
}
