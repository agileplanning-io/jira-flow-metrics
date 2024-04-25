import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { SummaryRow } from "@agileplanning-io/flow-metrics";
import { formatDate } from "@agileplanning-io/flow-lib";

export type ForecastChartProps = {
  summary: SummaryRow[];
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ summary }) => {
  const labels = summary.map(({ date }) => date.toISOString());
  const tooltips = summary.map((row) => {
    const percentComplete = Math.floor(row.endQuantile * 100);
    return `${percentComplete}% of trials finished by ${formatDate(row.date)}`;
  });

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        data: summary.map(({ count }) => count),
        backgroundColor: summary.map((row) =>
          getColorForQuantile(row.endQuantile),
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
            return tooltips[ctx.dataIndex];
          },
        },
        displayColors: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

function getColorForQuantile(quantile: number): string {
  if (quantile > 0.95) {
    return "#009600";
  }
  if (quantile > 0.85) {
    return "#00C900";
  }
  if (quantile > 0.7) {
    return "#C9C900";
  }
  if (quantile > 0.5) {
    return "#FF9B00";
  }
  return "#f44336";
}
