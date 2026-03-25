// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccessTime,
  CheckCircle,
  Cancel,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReferralCard from '../components/ReferralCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [capacityData, setCapacityData] = useState([]);

  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    () => dashboardService.getManagerDashboard(),
    {
      enabled: user?.role === 'hospital_manager',
      onSuccess: (data) => {
        setReferrals(data.referrals);
        setCapacityData(data.capacity);
      },
    }
  );

  if (isLoading) {
    return <LinearProgress />;
  }

  const stats = dashboardData?.stats || {
    totalReferrals: 0,
    pendingReferrals: 0,
    acceptedToday: 0,
    avgResponseTime: 0,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Hospital Manager Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Referrals
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalReferrals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingReferrals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccessTime />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Accepted Today
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.acceptedToday}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {stats.avgResponseTime} min
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Capacity Dashboard */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Department Capacity
        </Typography>
        <Grid container spacing={2}>
          {capacityData.map((dept) => (
            <Grid item xs={12} md={6} key={dept.name}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{dept.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {dept.occupiedBeds}/{dept.totalBeds} beds | {dept.availableSlots} slots
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(dept.occupiedBeds / dept.totalBeds) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: dept.occupancyRate > 80 ? '#ffebee' : '#e0e0e0',
                  }}
                />
                {dept.occupancyRate > 80 && (
                  <Alert severity="warning" sx={{ mt: 1 }} icon={<Warning />}>
                    High occupancy - {dept.occupancyRate}% full
                  </Alert>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Referrals List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Referrals
        </Typography>
        {referrals.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No pending referrals
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {referrals.map((referral) => (
              <Grid item xs={12} key={referral._id}>
                <ReferralCard referral={referral} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;