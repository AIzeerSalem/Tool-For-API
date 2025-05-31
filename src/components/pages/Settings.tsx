import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import { useApi } from '../../contexts/ApiContext';
import { storage } from '../../services/storage';
import { dataTransfer } from '../../services/dataTransfer';

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, isMockEnabled, toggleMockApi } = useApi();
  const [error, setError] = useState<string | null>(null);

  const handleExportData = async () => {
    try {
      await dataTransfer.downloadExport();
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await dataTransfer.uploadImport(file);
      window.location.reload(); // Refresh to load imported data
    } catch (error) {
      console.error('Failed to import data:', error);
      setError('Failed to import data');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appearance & Behavior
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Toggle dark/light theme"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mock API"
                  secondary="Use mock API responses for testing"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={isMockEnabled}
                    onChange={toggleMockApi}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" onClick={handleExportData}>
                  Export Data
                </Button>
                <Button
                  variant="contained"
                  component="label"
                >
                  Import Data
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportData}
                  />
                </Button>
              </Box>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Paper>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings; 