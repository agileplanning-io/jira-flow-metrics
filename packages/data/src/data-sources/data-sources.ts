type BaseDataSource = {
  name: string;
};

export type JiraDataSource = BaseDataSource & {
  type: "filter" | "project";
  jql: string;
};

export type LinearDataSource = BaseDataSource & {
  type: "team";
  id: string;
};

export type DataSource = JiraDataSource | LinearDataSource;
