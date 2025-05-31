import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import ProfileSelector from './components/ProfileSelector';
import RequestForm from './components/RequestForm';
import ResponseViewer from './components/ResponseViewer';
import { ApiProfile, ApiResponse } from './types/api';

function App() {
  const [selectedProfile, setSelectedProfile] = useState<ApiProfile | null>(null);
  const [profiles, setProfiles] = useState<ApiProfile[]>([]);
  const [lastResponse, setLastResponse] = useState<ApiResponse | null>(null);

  const handleProfileAdd = (profile: ApiProfile) => {
    setProfiles([...profiles, profile]);
  };

  const handleProfileSelect = (profile: ApiProfile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="App">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <ProfileSelector
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileSelect={handleProfileSelect}
            onProfileAdd={handleProfileAdd}
          />
          <RequestForm onResponse={setLastResponse} />
          {lastResponse && <ResponseViewer response={lastResponse} />}
        </Box>
      </Container>
    </div>
  );
}

export default App;
