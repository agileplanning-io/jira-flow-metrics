import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { SummaryRow } from "@agileplanning-io/flow-metrics";
import { getColorForPercentile } from "../util/styles";

export type ForecastChartProps = {
  summary: SummaryRow[];
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ summary }) => {
  const labels = summary.map(({ date }) => date.toISOString());

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        data: summary.map(({ count }) => count),
        backgroundColor: summary.map((row) =>
          getColorForPercentile(100 - row.endPercentile * 100),
        ),
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const scales: ChartOptions<"bar">["scales"] = {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
      position: "bottom",
    },
    y: {
      beginAtZero: true,
    },
  };

  const options: ChartOptions<"bar"> = {
    scales,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => {
            return [];
          },
          label: (ctx) => {
            return summary[ctx.dataIndex].tooltip;
          },
        },
        displayColors: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};
