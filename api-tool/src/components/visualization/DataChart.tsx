import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Box, Typography } from '@mui/material';

export interface DataChartProps {
  data: any;
  type?: 'line' | 'bar' | 'pie' | 'scatter';
  xField?: string;
  yField?: string;
  height?: number;
}

const DataChart: React.FC<DataChartProps> = ({
  data,
  type = 'bar',
  xField = 'id',
  yField = 'value',
  height = 300,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data for chart
    let chartData;
    if (Array.isArray(data)) {
      chartData = {
        labels: data.map(item => item[xField] || ''),
        datasets: [{
          label: yField,
          data: data.map(item => item[yField] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      };
    } else if (typeof data === 'object') {
      chartData = {
        labels: Object.keys(data),
        datasets: [{
          label: 'Value',
          data: Object.values(data),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      };
    } else {
      return;
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, xField, yField]);

  if (!data) {
    return (
      <Typography color="text.secondary" align="center">
        No data available for visualization
      </Typography>
    );
  }

  return (
    <Box sx={{ height }}>
      <canvas ref={chartRef} />
    </Box>
  );
};

export default DataChart; 