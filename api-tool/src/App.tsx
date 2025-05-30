import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ApiProvider } from './contexts/ApiContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import ApiProfiles from './components/pages/ApiProfiles';
import RequestHistory from './components/pages/RequestHistory';
import Settings from './components/pages/Settings';

const App: React.FC = () => {
  return (
    <ApiProvider>
      <ThemeProvider>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Header />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: { sm: 30 },
                backgroundColor: 'background.default'
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profiles" element={<ApiProfiles />} />
                <Route path="/history" element={<RequestHistory />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </ApiProvider>
  );
};

export default App;
