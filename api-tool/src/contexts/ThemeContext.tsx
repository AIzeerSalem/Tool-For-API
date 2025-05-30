import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { useApi } from './ApiContext';

const ThemeContext = createContext<null>(null);

export const useTheme = () => {
  useContext(ThemeContext);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useApi();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: isDarkMode ? '#121212' : '#f5f5f5',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
              },
            },
          },
          MuiCard: {
            defaultProps: {
              elevation: 0,
            },
            styleOverrides: {
              root: {
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={null}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 