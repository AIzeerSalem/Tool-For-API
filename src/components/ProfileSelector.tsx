import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { useApi } from '../hooks/useApi';
import { ApiProfile } from '../types';

type AuthType = 'none' | 'bearer' | 'basic';

interface ProfileSelectorProps {
  profiles: ApiProfile[];
  selectedProfile: ApiProfile | null;
  onProfileSelect: (profile: ApiProfile) => void;
  onProfileAdd: (profile: ApiProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  selectedProfile,
  onProfileSelect,
  onProfileAdd,
}) => {
  const [open, setOpen] = useState(false);
  const [newProfile, setNewProfile] = useState<Omit<ApiProfile, 'id'>>({
    name: '',
    baseUrl: '',
    authType: 'none',
    headers: {},
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAdd = () => {
    onProfileAdd({
      ...newProfile,
      id: Date.now().toString(),
    });
    handleClose();
    setNewProfile({
      name: '',
      baseUrl: '',
      authType: 'none',
      headers: {},
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl fullWidth>
          <InputLabel>API Profile</InputLabel>
          <Select
            value={selectedProfile?.id || ''}
            label="API Profile"
            onChange={(e) => {
              const profile = profiles.find((p) => p.id === e.target.value);
              if (profile) onProfileSelect(profile);
            }}
          >
            {profiles.map((profile) => (
              <MenuItem key={profile.id} value={profile.id}>
                {profile.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleOpen}>
          Add Profile
        </Button>
      </Stack>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add API Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Profile Name"
              value={newProfile.name}
              onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Base URL"
              value={newProfile.baseUrl}
              onChange={(e) => setNewProfile({ ...newProfile, baseUrl: e.target.value })}
              fullWidth
              placeholder="https://api.example.com"
            />
            <FormControl fullWidth>
              <InputLabel>Authentication Type</InputLabel>
              <Select
                value={newProfile.authType}
                label="Authentication Type"
                onChange={(e) => setNewProfile({ ...newProfile, authType: e.target.value as AuthType })}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="bearer">Bearer Token</MenuItem>
                <MenuItem value="basic">Basic Auth</MenuItem>
              </Select>
            </FormControl>
            {newProfile.authType !== 'none' && (
              <TextField
                label={newProfile.authType === 'bearer' ? 'Bearer Token' : 'Basic Auth Credentials'}
                value={newProfile.authValue || ''}
                onChange={(e) => setNewProfile({ ...newProfile, authValue: e.target.value })}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!newProfile.name || !newProfile.baseUrl}
          >
            Add Profile
          </Button>
        </DialogActions>
      </Dialog>

      {selectedProfile && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Base URL: {selectedProfile.baseUrl}
        </Typography>
      )}
    </Box>
  );
};

export default ProfileSelector; 