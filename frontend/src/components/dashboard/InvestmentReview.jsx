import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  Percent as PercentIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

// Dummy data for investment plans
const initialInvestmentPlans = [
  {
    id: 1,
    clientName: 'Rajesh Sharma',
    planName: 'Retirement Plan',
    targetAmount: 10000000,
    currentAmount: 4500000,
    startDate: '2018-05-15',
    targetDate: '2035-05-15',
    riskProfile: 'Moderate',
    status: 'On Track',
    monthlyContribution: 35000,
    assetAllocation: [
      { name: 'Equity', value: 60 },
      { name: 'Debt', value: 30 },
      { name: 'Gold', value: 10 },
    ],
    performanceHistory: [
      { year: '2018', returns: 8.5 },
      { year: '2019', returns: 12.3 },
      { year: '2020', returns: -3.2 },
      { year: '2021', returns: 15.7 },
      { year: '2022', returns: 7.2 },
      { year: '2023', returns: 9.8 },
    ],
    recommendations: [
      'Increase equity allocation by 5%',
      'Consider adding international equity exposure',
      'Review and optimize SIP amounts',
    ],
  },
  {
    id: 2,
    clientName: 'Priya Patel',
    planName: 'Child Education',
    targetAmount: 5000000,
    currentAmount: 1800000,
    startDate: '2019-08-10',
    targetDate: '2030-06-30',
    riskProfile: 'Conservative',
    status: 'Needs Attention',
    monthlyContribution: 25000,
    assetAllocation: [
      { name: 'Equity', value: 40 },
      { name: 'Debt', value: 50 },
      { name: 'Gold', value: 10 },
    ],
    performanceHistory: [
      { year: '2019', returns: 7.8 },
      { year: '2020', returns: 2.5 },
      { year: '2021', returns: 9.3 },
      { year: '2022', returns: 5.1 },
      { year: '2023', returns: 6.7 },
    ],
    recommendations: [
      'Increase monthly contribution to ₹30,000',
      'Consider adding more equity for long-term growth',
      'Review debt fund selection for better returns',
    ],
  },
  {
    id: 3,
    clientName: 'Amit Singh',
    planName: 'Wealth Creation',
    targetAmount: 20000000,
    currentAmount: 7500000,
    startDate: '2017-03-22',
    targetDate: '2037-03-22',
    riskProfile: 'Aggressive',
    status: 'On Track',
    monthlyContribution: 50000,
    assetAllocation: [
      { name: 'Equity', value: 75 },
      { name: 'Debt', value: 15 },
      { name: 'Alternatives', value: 10 },
    ],
    performanceHistory: [
      { year: '2017', returns: 14.2 },
      { year: '2018', returns: 9.7 },
      { year: '2019', returns: 16.3 },
      { year: '2020', returns: -5.8 },
      { year: '2021', returns: 22.5 },
      { year: '2022', returns: 8.3 },
      { year: '2023', returns: 12.9 },
    ],
    recommendations: [
      'Consider profit booking in some equity positions',
      'Add exposure to international markets',
      'Review and optimize tax efficiency',
    ],
  },
  {
    id: 4,
    clientName: 'Neha Gupta',
    planName: 'Home Purchase',
    targetAmount: 8000000,
    currentAmount: 2200000,
    startDate: '2020-11-05',
    targetDate: '2027-12-31',
    riskProfile: 'Moderate',
    status: 'At Risk',
    monthlyContribution: 40000,
    assetAllocation: [
      { name: 'Equity', value: 50 },
      { name: 'Debt', value: 45 },
      { name: 'Cash', value: 5 },
    ],
    performanceHistory: [
      { year: '2020', returns: 4.2 },
      { year: '2021', returns: 11.5 },
      { year: '2022', returns: 3.3 },
      { year: '2023', returns: 5.9 },
    ],
    recommendations: [
      'Increase monthly contribution to ₹50,000',
      'Consider more aggressive investment strategy',
      'Review timeline feasibility',
    ],
  },
  {
    id: 5,
    clientName: 'Vikram Mehta',
    planName: 'Early Retirement',
    targetAmount: 15000000,
    currentAmount: 9800000,
    startDate: '2015-06-18',
    targetDate: '2030-06-18',
    riskProfile: 'Moderate Aggressive',
    status: 'On Track',
    monthlyContribution: 60000,
    assetAllocation: [
      { name: 'Equity', value: 65 },
      { name: 'Debt', value: 25 },
      { name: 'Gold', value: 5 },
      { name: 'Alternatives', value: 5 },
    ],
    performanceHistory: [
      { year: '2015', returns: 10.2 },
      { year: '2016', returns: 12.7 },
      { year: '2017', returns: 15.3 },
      { year: '2018', returns: 7.8 },
      { year: '2019', returns: 14.5 },
      { year: '2020', returns: -2.3 },
      { year: '2021', returns: 18.9 },
      { year: '2022', returns: 6.7 },
      { year: '2023', returns: 10.5 },
    ],
    recommendations: [
      'Start transition to more conservative allocation',
      'Review withdrawal strategy options',
      'Consider tax-efficient withdrawal planning',
    ],
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  } else {
    return `₹${value}`;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'On Track': return 'success';
    case 'Needs Attention': return 'warning';
    case 'At Risk': return 'error';
    default: return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'On Track': return <CheckCircleIcon fontSize="small" />;
    case 'Needs Attention': return <WarningIcon fontSize="small" />;
    case 'At Risk': return <ErrorIcon fontSize="small" />;
    default: return <CheckCircleIcon fontSize="small" />;
  }
};

const InvestmentReview = ({ userRole }) => {
  const [investmentPlans, setInvestmentPlans] = useState(initialInvestmentPlans);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    clientName: '',
    planName: '',
    targetAmount: '',
    currentAmount: '',
    startDate: '',
    targetDate: '',
    riskProfile: '',
    monthlyContribution: '',
  });

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setCurrentPlan(plan);
      setFormData({
        clientName: plan.clientName,
        planName: plan.planName,
        targetAmount: plan.targetAmount,
        currentAmount: plan.currentAmount,
        startDate: plan.startDate,
        targetDate: plan.targetDate,
        riskProfile: plan.riskProfile,
        monthlyContribution: plan.monthlyContribution,
      });
    } else {
      setCurrentPlan(null);
      setFormData({
        clientName: '',
        planName: '',
        targetAmount: '',
        currentAmount: '',
        startDate: '',
        targetDate: '',
        riskProfile: 'Moderate',
        monthlyContribution: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Amount') || name === 'monthlyContribution' ? Number(value) : value,
    });
  };

  const handleSubmit = () => {
    if (currentPlan) {
      // Update existing plan
      const updatedPlan = {
        ...currentPlan,
        ...formData,
      };
      setInvestmentPlans(investmentPlans.map(plan => 
        plan.id === currentPlan.id ? updatedPlan : plan
      ));
      if (selectedPlan && selectedPlan.id === currentPlan.id) {
        setSelectedPlan(updatedPlan);
      }
    } else {
      // Add new plan
      const newPlan = {
        id: investmentPlans.length + 1,
        ...formData,
        status: 'On Track',
        assetAllocation: [
          { name: 'Equity', value: 60 },
          { name: 'Debt', value: 30 },
          { name: 'Gold', value: 10 },
        ],
        performanceHistory: [
          { year: new Date().getFullYear().toString(), returns: 0 },
        ],
        recommendations: [
          'Review asset allocation',
          'Set up regular SIPs',
          'Consider tax planning options',
        ],
      };
      setInvestmentPlans([...investmentPlans, newPlan]);
    }
    handleCloseDialog();
  };

  const handleDeletePlan = (id) => {
    setInvestmentPlans(investmentPlans.filter(plan => plan.id !== id));
    if (selectedPlan && selectedPlan.id === id) {
      setSelectedPlan(null);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Calculate years remaining
  const calculateYearsRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(diffYears * 10) / 10);
  };

  // Calculate average annual returns
  const calculateAverageReturns = (performanceHistory) => {
    if (!performanceHistory || performanceHistory.length === 0) return 0;
    const sum = performanceHistory.reduce((acc, curr) => acc + curr.returns, 0);
    return sum / performanceHistory.length;
  };

  // Render plan details
  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{selectedPlan.planName} - {selectedPlan.clientName}</Typography>
          <Chip 
            icon={getStatusIcon(selectedPlan.status)}
            label={selectedPlan.status} 
            color={getStatusColor(selectedPlan.status)} 
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Performance" />
            <Tab label="Recommendations" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Plan Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ mr: 1 }}>
                        {formatCurrency(selectedPlan.currentAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of {formatCurrency(selectedPlan.targetAmount)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(selectedPlan.currentAmount, selectedPlan.targetAmount)} 
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {calculateProgress(selectedPlan.currentAmount, selectedPlan.targetAmount)}% Complete
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Plan Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Risk Profile</Typography>
                        <Typography variant="body1">{selectedPlan.riskProfile}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Monthly Contribution</Typography>
                        <Typography variant="body1">{formatCurrency(selectedPlan.monthlyContribution)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                        <Typography variant="body1">{selectedPlan.startDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Target Date</Typography>
                        <Typography variant="body1">{selectedPlan.targetDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Years Remaining</Typography>
                        <Typography variant="body1">{calculateYearsRemaining(selectedPlan.targetDate)} years</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Avg. Annual Returns</Typography>
                        <Typography variant="body1">{calculateAverageReturns(selectedPlan.performanceHistory).toFixed(2)}%</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={selectedPlan.assetAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {selectedPlan.assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 2 }}>
                      {selectedPlan.assetAllocation.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              backgroundColor: COLORS[index % COLORS.length],
                              mr: 1,
                              borderRadius: '50%'
                            }} 
                          />
                          <Typography variant="body2">{item.name}: {item.value}%</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>Historical Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedPlan.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Returns']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="returns" 
                  name="Annual Returns" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Returns (%)</TableCell>
                    <TableCell align="right">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPlan.performanceHistory.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell component="th" scope="row">{row.year}</TableCell>
                      <TableCell align="right">{row.returns.toFixed(2)}%</TableCell>
                      <TableCell align="right">
                        {row.returns >= 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="success.main">
                              Positive
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="error.main">
                              Negative
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <List>
              {selectedPlan.recommendations.map((recommendation, index) => (
                <ListItem key={index} divider={index < selectedPlan.recommendations.length - 1}>
                  <ListItemIcon>
                    <FlagIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<AssessmentIcon />}
                  >
                    Generate Report
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<RefreshIcon />}
                  >
                    Rebalance Portfolio
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<TimelineIcon />}
                  >
                    Adjust Strategy
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Investment Plan Review
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Investment Plan
        </Button>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={selectedPlan ? 4 : 12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Investment Plans</Typography>
            <List sx={{ width: '100%' }}>
              {investmentPlans.map((plan) => (
                <ListItem 
                  key={plan.id} 
                  divider 
                  button 
                  selected={selectedPlan && selectedPlan.id === plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(plan);
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <AccountBalanceIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{plan.planName}</Typography>
                        <Chip 
                          size="small"
                          icon={getStatusIcon(plan.status)}
                          label={plan.status} 
                          color={getStatusColor(plan.status)} 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">{plan.clientName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculateProgress(plan.currentAmount, plan.targetAmount)} 
                            sx={{ height: 5, borderRadius: 5, flexGrow: 1, mr: 1 }}
                          />
                          <Typography variant="caption">
                            {calculateProgress(plan.currentAmount, plan.targetAmount)}%
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {selectedPlan && (
          <Grid item xs={12} md={8}>
            {renderPlanDetails()}
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Investment Plan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentPlan ? 'Edit Investment Plan' : 'New Investment Plan'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {currentPlan 
              ? 'Update the investment plan details below.'
              : 'Fill in the details to create a new investment plan.'}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="clientName"
                label="Client Name"
                value={formData.clientName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="planName"
                label="Plan Name"
                value={formData.planName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="targetAmount"
                label="Target Amount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                margin="dense"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="currentAmount"
                label="Current Amount"
                value={formData.currentAmount}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                margin="dense"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                value={formData.startDate}
                onChange={handleInputChange}
                fullWidth
                required
                type="date"
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="targetDate"
                label="Target Date"
                value={formData.targetDate}
                onChange={handleInputChange}
                fullWidth
                required
                type="date"
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Risk Profile</InputLabel>
                <Select
                  name="riskProfile"
                  value={formData.riskProfile}
                  onChange={handleInputChange}
                  label="Risk Profile"
                >
                  <MenuItem value="Conservative">Conservative</MenuItem>
                  <MenuItem value="Moderate Conservative">Moderate Conservative</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Moderate Aggressive">Moderate Aggressive</MenuItem>
                  <MenuItem value="Aggressive">Aggressive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="monthlyContribution"
                label="Monthly Contribution"
                value={formData.monthlyContribution}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                margin="dense"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentReview;