import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApi } from '../../contexts/ApiContext';
import { ApiProfile } from '../../types';

const defaultProfile: ApiProfile = {
  id: '',
  name: '',
  baseUrl: '',
  authType: 'none',
  headers: {},
};

const ApiProfiles: React.FC = () => {
  const { profiles, addProfile, updateProfile, deleteProfile } = useApi();
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ApiProfile | null>(null);
  const [formData, setFormData] = useState(defaultProfile);

  const handleOpen = (profile?: ApiProfile) => {
    if (profile) {
      setFormData(profile);
      setEditingProfile(profile);
    } else {
      setFormData({
        ...defaultProfile,
        id: `profile-${Date.now()}`,
      });
      setEditingProfile(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(defaultProfile);
    setEditingProfile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        await updateProfile(formData);
      } else {
        await addProfile(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleDelete = async (profile: ApiProfile) => {
    if (window.confirm(`Are you sure you want to delete the profile "${profile.name}"?`)) {
      await deleteProfile(profile.id);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">API Profiles</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Profile
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{profile.name}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {profile.baseUrl}
                  </Typography>
                  <Typography variant="body2">
                    Auth: {profile.authType.toUpperCase()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => handleOpen(profile)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(profile)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProfile ? 'Edit Profile' : 'Add Profile'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Profile Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Base URL"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Authentication Type</InputLabel>
                <Select
                  value={formData.authType}
                  label="Authentication Type"
                  onChange={(e) => setFormData({
                    ...formData,
                    authType: e.target.value as ApiProfile['authType'],
                    authValue: '',
                  })}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                </Select>
              </FormControl>
              {formData.authType !== 'none' && (
                <TextField
                  fullWidth
                  label={formData.authType === 'bearer' ? 'Bearer Token' : 'Basic Auth String'}
                  value={formData.authValue || ''}
                  onChange={(e) => setFormData({ ...formData, authValue: e.target.value })}
                  required
                />
              )}
              <TextField
                fullWidth
                label="API Key (Optional)"
                value={formData.apiKey || ''}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingProfile ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ApiProfiles; 