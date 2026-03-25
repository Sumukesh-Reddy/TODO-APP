// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Referrals from './pages/Referrals';
import CreateReferral from './pages/CreateReferral';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Consultation from './pages/Consultation';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Layout
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#ED6C02',
    },
    info: {
      main: '#0288D1',
    },
    success: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="referrals" element={<Referrals />} />
                    <Route path="referrals/create" element={<CreateReferral />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/:id" element={<PatientDetails />} />
                    <Route path="consultation/:id" element={<Consultation />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;