import { IssueQuery } from "../metrics-client/jira";

type BaseDataSource = {
  name: string;
  query: IssueQuery;
};

export type JiraDataSource = BaseDataSource & {
  type: "filter" | "project";
};

export type LinearDataSource = BaseDataSource & {
  type: "team";
};

export type DataSource = JiraDataSource | LinearDataSource;
