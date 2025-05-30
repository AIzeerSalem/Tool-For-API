import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useApi } from '../../contexts/ApiContext';
import { ApiProfile } from '../../types';

const Header: React.FC = () => {
  const {
    profiles,
    isDarkMode,
    toggleDarkMode,
    isMockEnabled,
    toggleMockApi,
  } = useApi();

  const handleProfileChange = (event: SelectChangeEvent<string>) => {
    const profileId = event.target.value;
    const profile = profiles.find((p: ApiProfile) => p.id === profileId);
    if (profile) {
      // TODO: Implement profile selection
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <CodeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          API Tool
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl
            size="small"
            sx={{ minWidth: 200 }}
          >
            <Select
              value=""
              onChange={handleProfileChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select API Profile
              </MenuItem>
              {profiles.map((profile: ApiProfile) => (
                <MenuItem key={profile.id} value={profile.id}>
                  {profile.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            onClick={toggleMockApi}
            color={isMockEnabled ? 'primary' : 'default'}
            title={isMockEnabled ? 'Mock API Enabled' : 'Mock API Disabled'}
          >
            <CodeIcon />
          </IconButton>

          <IconButton
            onClick={toggleDarkMode}
            color="inherit"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 