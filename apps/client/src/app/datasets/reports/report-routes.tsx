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
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "scatterplot"),
        title: ({ dataset }: NavigationContext) => [
          "Scatterplot",
          dataset?.name,
        ],
      }}
    />
    <Route
      path="histogram"
      element={<HistogramPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "histogram"),
        title: ({ dataset }: NavigationContext) => ["Histogram", dataset?.name],
      }}
    />
    <Route
      path="throughput"
      element={<ThroughputPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "throughput"),
        title: ({ dataset }: NavigationContext) => [
          "Throughput",
          dataset?.name,
        ],
      }}
    />
    <Route
      path="wip"
      element={<WipPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "wip"),
        title: ({ dataset }: NavigationContext) => ["WIP", dataset?.name],
      }}
    />
    <Route
      path="ageing-wip"
      element={<AgeingWipPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "ageing-wip"),
        title: ({ dataset }: NavigationContext) => [
          "Ageing WIP",
          dataset?.name,
        ],
      }}
    />
    <Route
      path="forecast"
      element={<ForecastPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "forecast"),
        title: ({ dataset }: NavigationContext) => ["Forecast", dataset?.name],
      }}
    />
    <Route
      path="time-spent"
      element={<TimeSpentPage />}
      handle={{
        crumb: ({ dataset }: NavigationContext) =>
          reportsCrumb(dataset?.id, "time-spent"),
        title: ({ dataset }: NavigationContext) => [
          "Time Spent",
          dataset?.name,
        ],
      }}
    />
    <Route index element={<Navigate to="scatterplot" />} />
  </Route>
);
