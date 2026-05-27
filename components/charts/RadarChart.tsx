"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarChartCPL() {
  const data = {
    labels: ['CPL 1', 'CPL 2', 'CPL 3', 'CPL 4', 'CPL 5', 'CPL 6', 'CPL 7', 'CPL 8', 'CPL 9', 'CPL 10'],
    datasets: [
      {
        label: 'Rata-rata Capaian Lulusan',
        data: [85, 90, 78, 88, 92, 75, 80, 85, 82, 89],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Target Minimum',
        data: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: 'rgba(0,0,0,0.1)' },
        grid: { color: 'rgba(0,0,0,0.1)' },
        pointLabels: {
          font: { family: 'inherit', size: 12, weight: 'bold' as const },
          color: '#64748b'
        },
        ticks: { backdropColor: 'transparent', stepSize: 20, max: 100, min: 0 }
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true } }
    },
    maintainAspectRatio: false,
  };

  return <Radar data={data} options={options} />;
}
