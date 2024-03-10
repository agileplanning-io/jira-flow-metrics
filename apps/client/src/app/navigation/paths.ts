import { generatePath } from "react-router-dom";
import { NavigationContext } from "./context";

const paths = {
  domains: {
    index: "/domains",
    projects: "/domains/:domainId/projects",
  },
  projects: {
    root: "/projects/:projectId",
  },
  issues: {
    index: "/projects/:projectId/issues",
    details: "/projects/:projectId/issues/:issueKey",
  },
  reports: {
    scatterplot: "/projects/:projectId/reports/scatterplot",
    histogram: "/projects/:projectId/reports/histogram",
    throughput: "/projects/:projectId/reports/throughput",
    wip: "/projects/:projectId/reports/wip",
    ageingWip: "/projects/:projectId/reports/ageing-wip",
    forecast: "/projects/:projectId/reports/forecast",
    timeSpent: "/projects/:projectId/reports/time-spent",
  },
};

export const projectsIndexPath = (
  params: Pick<NavigationContext, "domainId">,
) => generatePath(paths.domains.projects, params);

export const projectRootPath = (params: Pick<NavigationContext, "projectId">) =>
  generatePath(paths.projects.root, params);

export const issuesIndexPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.issues.index, params);

export const issueDetailsPath = (
  params: Pick<NavigationContext, "projectId" | "issueKey">,
): string => generatePath(paths.issues.details, params);

export const scatterplotPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.scatterplot, params);

export const histogramPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.histogram, params);

export const throughputPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.throughput, params);

export const wipPath = (params: Pick<NavigationContext, "projectId">): string =>
  generatePath(paths.reports.wip, params);

export const ageingWipPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.ageingWip, params);

export const forecastPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.forecast, params);

export const timeSpentPath = (
  params: Pick<NavigationContext, "projectId">,
): string => generatePath(paths.reports.timeSpent, params);
