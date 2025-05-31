import React, { useState, FormEvent } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import { useApi } from '../hooks/useApi';
import { isValidUrl } from '../utils/validation';
import { ApiResponse } from '../types';

interface Props {
  onResponse: (response: ApiResponse) => void;
}

const RequestForm: React.FC<Props> = ({ onResponse }) => {
  const api = useApi();
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!endpoint) {
      setValidationError('Endpoint is required');
      return;
    }

    if (!isValidUrl(api.currentProfile?.baseUrl + endpoint)) {
      setValidationError('Invalid URL');
      return;
    }

    try {
      let data;
      if (requestBody && (method === 'POST' || method === 'PUT')) {
        try {
          data = JSON.parse(requestBody);
        } catch {
          setValidationError('Invalid JSON in request body');
          return;
        }
      }

      const response = await api.request(method, endpoint, data);
      onResponse(response as ApiResponse);
    } catch (error: any) {
      setValidationError(error.message || 'Request failed');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Make Request
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Method</InputLabel>
            <Select
              value={method}
              label="Method"
              onChange={(e) => setMethod(e.target.value as typeof method)}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/endpoint"
            error={!!validationError && !endpoint}
          />
        </Box>

        {(method === 'POST' || method === 'PUT') && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Request Body (JSON)"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            error={!!validationError && !!requestBody && !isValidJson(requestBody)}
            sx={{ mb: 3 }}
          />
        )}

        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!endpoint || api.loading}
          >
            {api.loading ? 'Sending...' : 'Send Request'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export default RequestForm; 