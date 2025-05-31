import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
import { ApiResponse } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusCodeChartProps {
  responses: ApiResponse[];
}

const getStatusCodeCategory = (status: number): string => {
  if (status < 200) return 'Information';
  if (status < 300) return 'Success';
  if (status < 400) return 'Redirection';
  if (status < 500) return 'Client Error';
  return 'Server Error';
};

const statusColors = {
  Information: 'rgba(100, 181, 246, 0.8)',
  Success: 'rgba(129, 199, 132, 0.8)',
  Redirection: 'rgba(255, 183, 77, 0.8)',
  'Client Error': 'rgba(229, 115, 115, 0.8)',
  'Server Error': 'rgba(158, 158, 158, 0.8)',
};

export const StatusCodeChart: React.FC<StatusCodeChartProps> = ({ responses }) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const statusCounts = responses.reduce((acc, response) => {
      const category = getStatusCodeCategory(response.status);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data: ChartData<'pie'> = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(
            (category) => statusColors[category as keyof typeof statusColors]
          ),
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
        },
      ],
    };

    return data;
  }, [responses, theme.palette.background.paper]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme.palette.text.primary,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Status Code Distribution',
        color: theme.palette.text.primary,
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
        Status Code Analysis
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)', display: 'flex' }}>
        <Pie data={chartData} options={options} />
      </Box>
    </Paper>
  );
}; 