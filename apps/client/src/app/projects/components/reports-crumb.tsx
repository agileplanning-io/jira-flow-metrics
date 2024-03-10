import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { Link } from "react-router-dom";
import {
  ageingWipPath,
  forecastPath,
  histogramPath,
  issuesIndexPath,
  scatterplotPath,
  throughputPath,
  timeSpentPath,
  wipPath,
} from "../../navigation/paths";

export const reportsCrumb = (
  projectId: string | undefined,
  reportKey:
    | "scatterplot"
    | "histogram"
    | "throughput"
    | "wip"
    | "ageing-wip"
    | "forecast"
    | "issues"
    | "time-spent",
): ItemType => {
  const reportOptions = projectId
    ? [
        {
          key: "scatterplot",
          title: "Scatterplot",
          label: <Link to={scatterplotPath({ projectId })}>Scatterplot</Link>,
        },
        {
          key: "histogram",
          title: "Histogram",
          label: <Link to={histogramPath({ projectId })}>Histogram</Link>,
        },
        {
          key: "throughput",
          title: "Throughput",
          label: <Link to={throughputPath({ projectId })}>Throughput</Link>,
        },
        {
          key: "wip",
          title: "WIP",
          label: <Link to={wipPath({ projectId })}>WIP</Link>,
        },
        {
          key: "ageing-wip",
          title: "Ageing WIP",
          label: <Link to={ageingWipPath({ projectId })}>Ageing WIP</Link>,
        },
        {
          key: "forecast",
          title: "Forecast",
          label: <Link to={forecastPath({ projectId })}>Forecast</Link>,
        },
        {
          key: "time-spent",
          title: "Time Spent",
          label: <Link to={timeSpentPath({ projectId })}>Time Spent</Link>,
        },
      ]
    : [];
  const issueOptions = projectId
    ? [
        { type: "divider" },
        {
          key: "issues",
          title: "Issues",
          label: <Link to={issuesIndexPath({ projectId })}>Issues</Link>,
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
