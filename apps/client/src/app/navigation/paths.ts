import { generatePath } from "react-router-dom";
import { NavigationContext } from "./context";

const paths = {
  domains: {
    index: "/domains",
    datasets: "/domains/:domainId/datasets",
  },
  datasets: {
    root: "/datasets/:datasetId",
  },
  issues: {
    index: "/datasets/:datasetId/issues",
    details: "/datasets/:datasetId/issues/:issueKey",
  },
  reports: {
    scatterplot: "/datasets/:datasetId/reports/scatterplot",
    histogram: "/datasets/:datasetId/reports/histogram",
    throughput: "/datasets/:datasetId/reports/throughput",
    wip: "/datasets/:datasetId/reports/wip",
    ageingWip: "/datasets/:datasetId/reports/ageing-wip",
    forecast: "/datasets/:datasetId/reports/forecast",
    timeSpent: "/datasets/:datasetId/reports/time-spent",
  },
};

export const datasetsIndexPath = (
  params: Pick<NavigationContext, "domainId">,
) => generatePath(paths.domains.datasets, params);

export const datasetRootPath = (params: Pick<NavigationContext, "datasetId">) =>
  generatePath(paths.datasets.root, params);

export const issuesIndexPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.issues.index, params);

export const issueDetailsPath = (
  params: Pick<NavigationContext, "datasetId" | "issueKey">,
): string => generatePath(paths.issues.details, params);

export const scatterplotPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.scatterplot, params);

export const histogramPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.histogram, params);

export const throughputPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.throughput, params);

export const wipPath = (params: Pick<NavigationContext, "datasetId">): string =>
  generatePath(paths.reports.wip, params);

export const ageingWipPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.ageingWip, params);

export const forecastPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.forecast, params);

export const timeSpentPath = (
  params: Pick<NavigationContext, "datasetId">,
): string => generatePath(paths.reports.timeSpent, params);
