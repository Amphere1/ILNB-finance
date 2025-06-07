import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  Support,
  AttachMoney,
  CalendarMonth,
  AccountBalance,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

// Dummy data for different metrics
const dummyData = {
  topManagement: {
    totalAUM: '₹ 1,250,000,000',
    monthlySIP: '₹ 15,000,000',
    totalClients: 1250,
    activeLeads: 450,
    pendingTasks: 120,
    serviceRequests: 85,
    teamPerformance: [
      { name: 'Team A', value: 95 },
      { name: 'Team B', value: 88 },
      { name: 'Team C', value: 76 },
      { name: 'Team D', value: 92 },
    ],
    monthlyPerformance: [
      { month: 'Jan', aum: 950, sip: 120 },
      { month: 'Feb', aum: 970, sip: 125 },
      { month: 'Mar', aum: 1000, sip: 130 },
      { month: 'Apr', aum: 1050, sip: 135 },
      { month: 'May', aum: 1100, sip: 140 },
      { month: 'Jun', aum: 1200, sip: 145 },
    ],
  },
  businessHead: {
    totalAUM: '₹ 450,000,000',
    monthlySIP: '₹ 5,500,000',
    totalClients: 450,
    activeLeads: 180,
    pendingTasks: 65,
    serviceRequests: 42,
    rmPerformance: [
      { name: 'RM Head 1', value: 92 },
      { name: 'RM Head 2', value: 85 },
      { name: 'RM Head 3', value: 78 },
    ],
    monthlyPerformance: [
      { month: 'Jan', aum: 400, sip: 50 },
      { month: 'Feb', aum: 410, sip: 52 },
      { month: 'Mar', aum: 420, sip: 53 },
      { month: 'Apr', aum: 430, sip: 54 },
      { month: 'May', aum: 440, sip: 55 },
      { month: 'Jun', aum: 450, sip: 56 },
    ],
  },
  rmHead: {
    totalAUM: '₹ 150,000,000',
    monthlySIP: '₹ 1,800,000',
    totalClients: 180,
    activeLeads: 75,
    pendingTasks: 35,
    serviceRequests: 22,
    rmPerformance: [
      { name: 'RM 1', value: 88 },
      { name: 'RM 2', value: 75 },
      { name: 'RM 3', value: 92 },
      { name: 'RM 4', value: 80 },
    ],
    monthlyPerformance: [
      { month: 'Jan', aum: 130, sip: 16 },
      { month: 'Feb', aum: 135, sip: 16.5 },
      { month: 'Mar', aum: 140, sip: 17 },
      { month: 'Apr', aum: 145, sip: 17.5 },
      { month: 'May', aum: 148, sip: 18 },
      { month: 'Jun', aum: 150, sip: 18 },
    ],
  },
  rm: {
    totalAUM: '₹ 35,000,000',
    monthlySIP: '₹ 450,000',
    totalClients: 45,
    activeLeads: 18,
    pendingTasks: 12,
    serviceRequests: 8,
    upcomingMeetings: [
      { client: 'Rajesh Sharma', time: '10:00 AM', date: 'Today' },
      { client: 'Priya Patel', time: '2:30 PM', date: 'Today' },
      { client: 'Amit Singh', time: '11:00 AM', date: 'Tomorrow' },
      { client: 'Neha Gupta', time: '4:00 PM', date: 'Tomorrow' },
    ],
    monthlyPerformance: [
      { month: 'Jan', aum: 30, sip: 4 },
      { month: 'Feb', aum: 31, sip: 4.1 },
      { month: 'Mar', aum: 32, sip: 4.2 },
      { month: 'Apr', aum: 33, sip: 4.3 },
      { month: 'May', aum: 34, sip: 4.4 },
      { month: 'Jun', aum: 35, sip: 4.5 },
    ],
  },
};

const Overview = () => {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role;

  useEffect(() => {
    // Set data based on user role
    switch (userRole) {
      case 'top_management':
        setData(dummyData.topManagement);
        break;
      case 'business_head':
        setData(dummyData.businessHead);
        break;
      case 'rm_head':
        setData(dummyData.rmHead);
        break;
      case 'rm':
      default:
        setData(dummyData.rm);
        break;
    }
  }, [userRole]);

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Total AUM
              </Typography>
              <AccountBalance />
            </Box>
            <Typography component="p" variant="h4">
              {data.totalAUM}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              as of today
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Monthly SIP
              </Typography>
              <AttachMoney />
            </Box>
            <Typography component="p" variant="h4">
              {data.monthlySIP}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              current month
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#4caf50',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Total Clients
              </Typography>
              <People />
            </Box>
            <Typography component="p" variant="h4">
              {data.totalClients}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              active clients
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ff9800',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Active Leads
              </Typography>
              <TrendingUp />
            </Box>
            <Typography component="p" variant="h4">
              {data.activeLeads}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              in pipeline
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Monthly Performance
            </Typography>
            <ResponsiveContainer width="103%" height={300}>
              <BarChart
                data={data.monthlyPerformance}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="aum" name="AUM (in millions)" fill="#8884d8" />
                <Bar dataKey="sip" name="SIP (in millions)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Role-specific content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              {userRole === 'rm' ? 'Upcoming Meetings' : 'Team Performance'}
            </Typography>
            {userRole === 'rm' ? (
              <List>
                {data.upcomingMeetings.map((meeting, index) => (
                  <ListItem key={index} divider={index !== data.upcomingMeetings.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CalendarMonth />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={meeting.client}
                      secondary={`${meeting.date} at ${meeting.time}`}
                    />
                    <Chip
                      label={meeting.date === 'Today' ? 'Today' : 'Tomorrow'}
                      color={meeting.date === 'Today' ? 'error' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {(data.teamPerformance || data.rmPerformance).map((item, index) => (
                  <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: `${item.value}%`,
                          height: 10,
                          bgcolor: item.value > 90 ? 'success.main' : item.value > 80 ? 'primary.main' : 'warning.main',
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {item.value}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Activity Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Assignment color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Tasks
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div">
                      {data.pendingTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending tasks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Support color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Service
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div">
                      {data.serviceRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open requests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;