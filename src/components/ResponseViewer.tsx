import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ApiResponse } from '../types';

interface Props {
  response: ApiResponse;
}

const ResponseViewer: React.FC<Props> = ({ response }) => {
  const getStatusColor = (status: number): 'success' | 'warning' | 'error' | 'default' => {
    if (status < 300) return 'success';
    if (status < 400) return 'warning';
    if (status < 600) return 'error';
    return 'default';
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Response
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Chip
          label={`${response.status} ${response.statusText}`}
          color={getStatusColor(response.status)}
          sx={{ mr: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          Received at: {new Date(response.timestamp).toLocaleString()}
        </Typography>
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Headers
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Header</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(response.headers).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle2" gutterBottom>
        Response Body
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: 'grey.100',
          fontFamily: 'monospace',
          overflow: 'auto',
          maxHeight: 400,
        }}
      >
        <pre style={{ margin: 0 }}>{formatValue(response.data)}</pre>
      </Paper>
    </Paper>
  );
};

export default ResponseViewer; 