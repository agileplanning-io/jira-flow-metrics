import { Navigate, Route } from "react-router-dom";
import { ScatterplotPage } from "./scatterplot/scatterplot-page";
import { NavigationContext } from "../../navigation/context";
import { ThroughputPage } from "./throughput/throughput-page";
import { WipPage } from "./wip/wip-page";
import { ForecastPage } from "./forecast/forecast-page";
import { reportsCrumb } from "../components/reports-crumb";
import { TimeSpentPage } from "./time-spent/time-spent-page";
import { AgeingWipPage } from "./ageing-wip/ageing-wip-page";
import { HistogramPage } from "./histogram/histogram-page";

export const reportRoutes = (
  <Route path="reports">
    <Route
      path="scatterplot"
      element={<ScatterplotPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "scatterplot"),
        title: ({ project }: NavigationContext) => [
          "Scatterplot",
          project?.name,
        ],
      }}
    />
    <Route
      path="histogram"
      element={<HistogramPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "histogram"),
        title: ({ project }: NavigationContext) => ["Histogram", project?.name],
      }}
    />
    <Route
      path="throughput"
      element={<ThroughputPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "throughput"),
        title: ({ project }: NavigationContext) => [
          "Throughput",
          project?.name,
        ],
      }}
    />
    <Route
      path="wip"
      element={<WipPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "wip"),
        title: ({ project }: NavigationContext) => ["WIP", project?.name],
      }}
    />
    <Route
      path="ageing-wip"
      element={<AgeingWipPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "ageing-wip"),
        title: ({ project }: NavigationContext) => [
          "Ageing WIP",
          project?.name,
        ],
      }}
    />
    <Route
      path="forecast"
      element={<ForecastPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "forecast"),
        title: ({ project }: NavigationContext) => ["Forecast", project?.name],
      }}
    />
    <Route
      path="time-spent"
      element={<TimeSpentPage />}
      handle={{
        crumb: ({ project }: NavigationContext) =>
          reportsCrumb(project?.id, "time-spent"),
        title: ({ project }: NavigationContext) => [
          "Time Spent",
          project?.name,
        ],
      }}
    />
    <Route index element={<Navigate to="scatterplot" />} />
  </Route>
);
