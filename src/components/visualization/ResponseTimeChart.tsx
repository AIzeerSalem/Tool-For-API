import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
import { ApiRequest, ApiResponse } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ResponseTimeChartProps {
  history: Array<{ request: ApiRequest; response: ApiResponse }>;
  limit?: number;
}

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({
  history,
  limit = 20,
}) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const recentHistory = history.slice(-limit);
    
    const data: ChartData<'line'> = {
      labels: recentHistory.map((item) => {
        const date = new Date(item.response.timestamp);
        return date.toLocaleTimeString();
      }),
      datasets: [
        {
          label: 'Response Time (ms)',
          data: recentHistory.map((item) => {
            const requestTime = item.request.timestamp;
            const responseTime = item.response.timestamp;
            return responseTime - requestTime;
          }),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light,
          tension: 0.4,
        },
      ],
    };

    return data;
  }, [history, limit, theme.palette.primary]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
        },
      },
      title: {
        display: true,
        text: 'API Response Times',
        color: theme.palette.text.primary,
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: 400,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Response Time Analysis
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}; 