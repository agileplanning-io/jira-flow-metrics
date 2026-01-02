import { DataSource } from "../data-sources/data-sources";

export interface MetricsClient {
  findDataSources: (query: string) => Promise<DataSource[]>;
}
