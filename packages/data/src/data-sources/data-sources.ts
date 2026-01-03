import { IssueQuery } from "../metrics-client/jira";

type BaseDataSource = {
  name: string;
};

export type JiraDataSource = BaseDataSource & {
  type: "filter" | "project";
  query: IssueQuery;
};

export type LinearDataSource = BaseDataSource & {
  type: "team";
  // TODO: convert to IssueQuery
  id: string;
};

export type DataSource = JiraDataSource | LinearDataSource;
