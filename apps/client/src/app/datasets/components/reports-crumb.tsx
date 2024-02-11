import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { Link } from "react-router-dom";
import {
  ageingWipPath,
  forecastPath,
  issuesIndexPath,
  scatterplotPath,
  throughputPath,
  timeSpentPath,
  wipPath,
} from "../../navigation/paths";

export const reportsCrumb = (
  datasetId: string | undefined,
  reportKey:
    | "scatterplot"
    | "throughput"
    | "wip"
    | "ageing-wip"
    | "forecast"
    | "issues"
    | "time-spent",
): ItemType => {
  const reportOptions = datasetId
    ? [
        {
          key: "scatterplot",
          title: "Scatterplot",
          label: <Link to={scatterplotPath({ datasetId })}>Scatterplot</Link>,
        },
        {
          key: "throughput",
          title: "Throughput",
          label: <Link to={throughputPath({ datasetId })}>Throughput</Link>,
        },
        {
          key: "wip",
          title: "WIP",
          label: <Link to={wipPath({ datasetId })}>WIP</Link>,
        },
        {
          key: "ageing-wip",
          title: "Ageing WIP",
          label: <Link to={ageingWipPath({ datasetId })}>Ageing WIP</Link>,
        },
        {
          key: "forecast",
          title: "Forecast",
          label: <Link to={forecastPath({ datasetId })}>Forecast</Link>,
        },
        {
          key: "time-spent",
          title: "Time Spent",
          label: <Link to={timeSpentPath({ datasetId })}>Time Spent</Link>,
        },
      ]
    : [];
  const issueOptions = datasetId
    ? [
        { type: "divider" },
        {
          key: "issues",
          title: "Issues",
          label: <Link to={issuesIndexPath({ datasetId })}>Issues</Link>,
        },
      ]
    : [];

  const items = [...reportOptions, ...issueOptions];

  const currentReport = items.find((report) => report.key === reportKey);

  return {
    title: currentReport?.title,
    menu: { items, selectedKeys: [reportKey] },
  };
};
