import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { SummaryResult } from "@agileplanning-io/flow-metrics";
import { addDays } from "date-fns";

export type ForecastChartProps = {
  summary: SummaryResult;
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ summary }) => {
  const labels = summary.rows.map(({ time }) =>
    typeof time === "number" ? time : time.toISOString(),
  );

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        data: summary.rows.map(({ count }) => count),
        backgroundColor: summary.rows.map((row) =>
          getColorForPercentile(row.endPercentile),
        ),
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const scales: ChartOptions<"bar">["scales"] = {
    x: {
      type: summary.startDate ? "time" : "linear",
      time: {
        unit: "day",
      },
      title: {
        text: "Completion Date",
        display: true,
      },
      position: "bottom",
    },
    y: {
      beginAtZero: true,
    },
  };

  const annotations = Object.fromEntries(
    summary.percentiles.map((p) => {
      console.info({ percentile: p });
      const options: AnnotationOptions = {
        type: "line",
        borderColor: getColorForPercentile(p.percentile / 100),
        borderWidth: 1,
        borderDash: ![15, 85].includes(p.percentile) ? [4, 4] : undefined,
        label: {
          backgroundColor: "#FFF",
          padding: 4,
          position: "start",
          content: `${p.percentile.toString()}%`,
          display: true,
          textAlign: "start",
          color: "#666666",
          font: {
            size: 16,
          },
        },
        scaleID: "x",
        value: summary.startDate
          ? addDays(summary.startDate, p.value).toISOString()
          : p.value,
      };
      return [p.percentile.toString(), options];
    }),
  );

  const options: ChartOptions<"bar"> = {
    scales,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      annotation: {
        annotations,
      },
      tooltip: {
        callbacks: {
          title: () => {
            return [];
          },
          label: (ctx) => {
            return summary.rows[ctx.dataIndex].tooltip;
          },
        },
        displayColors: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

function getColorForPercentile(percentile: number): string {
  if (percentile > 0.95) {
    return "#009600";
  }
  if (percentile > 0.85) {
    return "#00C900";
  }
  if (percentile > 0.7) {
    return "#C9C900";
  }
  if (percentile > 0.5) {
    return "#FF9B00";
  }
  return "#f44336";
}
