import { Host, JiraHost, LinearHost } from "./hosts";

type BaseDataSource = {
  host: Host;
  name: string;
};

export type JiraDataSource = BaseDataSource & {
  host: JiraHost;
  type: "filter" | "project";
  jql: string;
};

export type LinearDataSource = BaseDataSource & {
  host: LinearHost;
  type: "team";
  id: string;
};

export type DataSource = JiraDataSource | LinearDataSource;
