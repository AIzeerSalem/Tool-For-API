import React from 'react';
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
} from '@mui/material';
import { useApi } from '../../contexts/ApiContext';
import { storage } from '../../services/storage';

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, isMockEnabled, toggleMockApi } = useApi();

  const handleExportData = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-tool-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const data = JSON.parse(content);
      await storage.importData(data);
      window.location.reload(); // Refresh to load imported data
    } catch (error) {
      console.error('Failed to import data:', error);
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
            <Stack spacing={2} direction="row">
              <Button
                variant="outlined"
                onClick={handleExportData}
              >
                Export Data
              </Button>
              <Button
                variant="outlined"
                component="label"
              >
                Import Data
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleImportData}
                />
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings; 