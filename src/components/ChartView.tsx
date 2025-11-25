import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { ChartConfig } from "../lib/chartSelector";

// Register just what we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

interface ChartViewProps {
  config: ChartConfig | null;
}

export const ChartView: React.FC<ChartViewProps> = ({ config }) => {
  if (!config) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/60 text-[11px] text-muted">
        Run a query that returns at least one numeric column to see a chart
        preview here.
      </div>
    );
  }

  const data = {
    labels: config.labels,
    datasets: config.datasets.map((d, idx) => ({
      ...d,
      borderWidth: 1.5,
      // soft neon-style palette; Chart.js will pick defaults if omitted,
      // but we give a couple hints for nicer contrast.
      backgroundColor:
        idx === 0 ? "rgba(139, 92, 246, 0.5)" : "rgba(34, 211, 238, 0.5)",
      borderColor:
        idx === 0 ? "rgba(139, 92, 246, 1)" : "rgba(34, 211, 238, 1)"
    }))
  };

  const commonOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#E2E8F0",
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        displayColors: false
      }
    },
    scales:
      config.type === "pie"
        ? {}
        : {
            x: {
              ticks: {
                color: "#94A3B8",
                font: { size: 9 }
              },
              grid: {
                color: "rgba(15,23,42,0.6)"
              },
              title: config.xLabel
                ? {
                    display: true,
                    text: config.xLabel,
                    color: "#94A3B8",
                    font: { size: 10 }
                  }
                : undefined
            },
            y: {
              ticks: {
                color: "#94A3B8",
                font: { size: 9 }
              },
              grid: {
                color: "rgba(15,23,42,0.6)"
              },
              title: config.yLabel
                ? {
                    display: true,
                    text: config.yLabel,
                    color: "#94A3B8",
                    font: { size: 10 }
                  }
                : undefined
            }
          }
  };

  return (
    <div className="space-y-2">
      <div className="h-64 rounded-xl border border-slate-700/70 bg-slate-950/90 p-3">
        {config.type === "bar" && <Bar data={data} options={commonOptions} />}
        {config.type === "line" && <Line data={data} options={commonOptions} />}
        {config.type === "pie" && <Pie data={data} options={commonOptions} />}
        {config.type === "scatter" && (
          <Scatter data={data} options={commonOptions} />
        )}
      </div>
      {config.description && (
        <p className="text-[11px] text-muted">{config.description}</p>
      )}
    </div>
  );
};
