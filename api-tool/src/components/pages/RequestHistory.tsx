import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Replay as ReplayIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApi } from '../../contexts/ApiContext';
import { ApiRequest, ApiResponse } from '../../types';

interface RequestDetailsDialogProps {
  request: ApiRequest;
  response: ApiResponse;
  open: boolean;
  onClose: () => void;
}

const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  request,
  response,
  open,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Request Details</DialogTitle>
    <DialogContent>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6">Request</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(request, null, 2)}
          </pre>
        </Box>
        <Box>
          <Typography variant="h6">Response</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </Box>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const RequestHistory: React.FC = () => {
  const { history, clearHistory, replayRequest, deleteHistoryItem } = useApi();
  const [selectedRequest, setSelectedRequest] = useState<{
    request: ApiRequest;
    response: ApiResponse;
  } | null>(null);

  const handleReplay = async (request: ApiRequest) => {
    try {
      await replayRequest(request);
    } catch (error) {
      console.error('Failed to replay request:', error);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      await deleteHistoryItem(requestId);
    }
  };

  const getStatusColor = (status: number) => {
    if (status < 300) return 'success';
    if (status < 400) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Request History</Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all history?')) {
              clearHistory();
            }
          }}
        >
          Clear History
        </Button>
      </Stack>

      <Stack spacing={2}>
        {history.map(({ request, response }) => (
          <Card key={request.id}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={request.method}
                      color="primary"
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(request.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedRequest({ request, response })}
                    >
                      <InfoIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleReplay(request)}
                    >
                      <ReplayIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(request.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Box>
                  <Typography variant="subtitle1" component="div" gutterBottom>
                    {request.url}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${response.status}`}
                      color={getStatusColor(response.status)}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {response.statusText}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest.request}
          response={selectedRequest.response}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </Box>
  );
};

export default RequestHistory; 