import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Grid,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useApi } from '../../contexts/ApiContext';
import { ApiProfile } from '../../types';
import { Chart } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Dashboard: React.FC = () => {
  const { profiles, history } = useApi();
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [method, setMethod] = useState<string>('GET');
  const [endpoint, setEndpoint] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement request submission
  };

  const getResponseTimeData = () => {
    const last10Requests = history.slice(-10);
    return {
      labels: last10Requests.map(({ request }) => 
        new Date(request.timestamp).toLocaleTimeString()
      ),
      datasets: [{
        label: 'Response Time (ms)',
        data: last10Requests.map(({ response }) => 
          response.timestamp - response.timestamp
        ),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }],
    };
  };

  const getStatusCodeData = () => {
    const statusCounts = history.reduce((acc, { response }) => {
      const status = response.status.toString();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Status Code Distribution',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      }],
    };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>API Profile</InputLabel>
                    <Select
                      value={selectedProfile}
                      label="API Profile"
                      onChange={(e) => setSelectedProfile(e.target.value)}
                    >
                      {profiles.map((profile: ApiProfile) => (
                        <MenuItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={method}
                      label="Method"
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/resource"
                  />

                  {method !== 'GET' && (
                    <TextField
                      fullWidth
                      label="Request Body"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      multiline
                      rows={4}
                      placeholder="Enter JSON request body"
                    />
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    disabled={!selectedProfile || !endpoint}
                  >
                    Send Request
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              centered
            >
              <Tab label="Response Times" />
              <Tab label="Status Codes" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Line data={getResponseTimeData()} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Line data={getStatusCodeData()} />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 