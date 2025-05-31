import React, { useMemo, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { ApiRequest } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RequestMethodChartProps {
  requests: ApiRequest[];
}

const methodColors = {
  GET: 'rgba(100, 181, 246, 0.8)',
  POST: 'rgba(129, 199, 132, 0.8)',
  PUT: 'rgba(255, 183, 77, 0.8)',
  DELETE: 'rgba(229, 115, 115, 0.8)',
  PATCH: 'rgba(186, 104, 200, 0.8)',
};

export const RequestMethodChart: React.FC<RequestMethodChartProps> = ({ requests }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  // Handle initial loading and hot reloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      clearTimeout(timer);
      const chartInstance = ChartJS.getChart("request-methods-chart");
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  // Reset chart on hot reload or data change
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [requests]);

  const chartData = useMemo(() => {
    if (!requests || requests.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Number of Requests',
          data: [],
          backgroundColor: [],
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
        }]
      };
    }

    const methodCounts = requests.reduce((acc, request) => {
      acc[request.method] = (acc[request.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data: ChartData<'bar'> = {
      labels: Object.keys(methodCounts),
      datasets: [
        {
          label: 'Number of Requests',
          data: Object.values(methodCounts),
          backgroundColor: Object.keys(methodCounts).map(
            (method) => methodColors[method as keyof typeof methodColors]
          ),
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
        },
      ],
    };

    return data;
  }, [requests, theme.palette.background.paper]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 250 // Faster animation for smoother updates
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Request Methods Distribution',
        color: theme.palette.text.primary,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
        display: true,
      },
      y: {
        type: 'linear' as const,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 1,
          beginAtZero: true,
        },
        display: true,
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
        position: 'relative',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Request Methods Analysis
      </Typography>
      <Box 
        sx={{ 
          height: 'calc(100% - 40px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : !requests ? (
          <Typography color="textSecondary">
            Loading request data...
          </Typography>
        ) : requests.length === 0 ? (
          <Typography color="textSecondary">
            No request data available
          </Typography>
        ) : (
          <Bar 
            key={chartKey}
            data={chartData} 
            options={options} 
            id={`request-methods-chart-${chartKey}`}
          />
        )}
      </Box>
    </Paper>
  );
}; 