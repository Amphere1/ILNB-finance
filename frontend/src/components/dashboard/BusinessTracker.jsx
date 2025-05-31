import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Dummy data for SIP
const sipData = [
  { month: 'Jan', amount: 1250000, count: 125 },
  { month: 'Feb', amount: 1320000, count: 132 },
  { month: 'Mar', amount: 1450000, count: 145 },
  { month: 'Apr', amount: 1380000, count: 138 },
  { month: 'May', amount: 1520000, count: 152 },
  { month: 'Jun', amount: 1680000, count: 168 },
  { month: 'Jul', amount: 1750000, count: 175 },
  { month: 'Aug', amount: 1820000, count: 182 },
  { month: 'Sep', amount: 1950000, count: 195 },
  { month: 'Oct', amount: 2100000, count: 210 },
  { month: 'Nov', amount: 2250000, count: 225 },
  { month: 'Dec', amount: 2400000, count: 240 },
];

// Dummy data for Demat
const dematData = [
  { month: 'Jan', newAccounts: 18, totalAccounts: 320, revenue: 90000 },
  { month: 'Feb', newAccounts: 22, totalAccounts: 342, revenue: 110000 },
  { month: 'Mar', newAccounts: 25, totalAccounts: 367, revenue: 125000 },
  { month: 'Apr', newAccounts: 20, totalAccounts: 387, revenue: 100000 },
  { month: 'May', newAccounts: 28, totalAccounts: 415, revenue: 140000 },
  { month: 'Jun', newAccounts: 32, totalAccounts: 447, revenue: 160000 },
  { month: 'Jul', newAccounts: 35, totalAccounts: 482, revenue: 175000 },
  { month: 'Aug', newAccounts: 30, totalAccounts: 512, revenue: 150000 },
  { month: 'Sep', newAccounts: 38, totalAccounts: 550, revenue: 190000 },
  { month: 'Oct', newAccounts: 42, totalAccounts: 592, revenue: 210000 },
  { month: 'Nov', newAccounts: 45, totalAccounts: 637, revenue: 225000 },
  { month: 'Dec', newAccounts: 50, totalAccounts: 687, revenue: 250000 },
];

// Dummy data for AUM
const aumData = [
  { month: 'Jan', equity: 450000000, debt: 320000000, hybrid: 230000000, total: 1000000000 },
  { month: 'Feb', equity: 470000000, debt: 325000000, hybrid: 235000000, total: 1030000000 },
  { month: 'Mar', equity: 490000000, debt: 330000000, hybrid: 240000000, total: 1060000000 },
  { month: 'Apr', equity: 510000000, debt: 335000000, hybrid: 245000000, total: 1090000000 },
  { month: 'May', equity: 530000000, debt: 340000000, hybrid: 250000000, total: 1120000000 },
  { month: 'Jun', equity: 550000000, debt: 345000000, hybrid: 255000000, total: 1150000000 },
  { month: 'Jul', equity: 570000000, debt: 350000000, hybrid: 260000000, total: 1180000000 },
  { month: 'Aug', equity: 590000000, debt: 355000000, hybrid: 265000000, total: 1210000000 },
  { month: 'Sep', equity: 610000000, debt: 360000000, hybrid: 270000000, total: 1240000000 },
  { month: 'Oct', equity: 630000000, debt: 365000000, hybrid: 275000000, total: 1270000000 },
  { month: 'Nov', equity: 650000000, debt: 370000000, hybrid: 280000000, total: 1300000000 },
  { month: 'Dec', equity: 670000000, debt: 375000000, hybrid: 285000000, total: 1330000000 },
];

// Dummy data for team performance
const teamPerformanceData = [
  { name: 'Amit Kumar', sip: 450000, demat: 12, aum: 180000000 },
  { name: 'Neha Singh', sip: 380000, demat: 10, aum: 150000000 },
  { name: 'Rahul Verma', sip: 520000, demat: 15, aum: 210000000 },
  { name: 'Priya Sharma', sip: 320000, demat: 8, aum: 120000000 },
  { name: 'Vikram Mehta', sip: 480000, demat: 14, aum: 190000000 },
];

// Dummy data for asset allocation
const assetAllocationData = [
  { name: 'Equity', value: 670000000 },
  { name: 'Debt', value: 375000000 },
  { name: 'Hybrid', value: 285000000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

const BusinessTracker = ({ userRole }) => {
  const [timeFrame, setTimeFrame] = useState('yearly');
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('bar');
  
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Filter data based on time frame
  const getFilteredData = (data) => {
    if (timeFrame === 'monthly') {
      return data.slice(-1); // Last month
    } else if (timeFrame === 'quarterly') {
      return data.slice(-3); // Last quarter
    } else if (timeFrame === 'half-yearly') {
      return data.slice(-6); // Last half year
    } else {
      return data; // Full year
    }
  };

  const filteredSipData = getFilteredData(sipData);
  const filteredDematData = getFilteredData(dematData);
  const filteredAumData = getFilteredData(aumData);

  // Calculate totals and growth
  const calculateTotals = () => {
    const currentSipAmount = sipData[sipData.length - 1].amount;
    const previousSipAmount = sipData[sipData.length - 2].amount;
    const sipGrowth = ((currentSipAmount - previousSipAmount) / previousSipAmount) * 100;

    const currentDematAccounts = dematData[dematData.length - 1].totalAccounts;
    const previousDematAccounts = dematData[dematData.length - 2].totalAccounts;
    const dematGrowth = ((currentDematAccounts - previousDematAccounts) / previousDematAccounts) * 100;

    const currentAum = aumData[aumData.length - 1].total;
    const previousAum = aumData[aumData.length - 2].total;
    const aumGrowth = ((currentAum - previousAum) / previousAum) * 100;

    return {
      sipAmount: currentSipAmount,
      sipGrowth,
      dematAccounts: currentDematAccounts,
      dematGrowth,
      aum: currentAum,
      aumGrowth,
    };
  };

  const totals = calculateTotals();

  // Render different charts based on selected tab and chart type
  const renderChart = () => {
    if (tabValue === 0) { // SIP
      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredSipData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip formatter={(value, name) => [
                name === 'amount' ? formatCurrency(value) : value,
                name === 'amount' ? 'SIP Amount' : 'SIP Count'
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="amount" name="SIP Amount" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="count" name="SIP Count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'line') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredSipData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip formatter={(value, name) => [
                name === 'amount' ? formatCurrency(value) : value,
                name === 'amount' ? 'SIP Amount' : 'SIP Count'
              ]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="amount" name="SIP Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="count" name="SIP Count" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      } else { // Table view
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">SIP Amount</TableCell>
                  <TableCell align="right">SIP Count</TableCell>
                  <TableCell align="right">Avg. SIP Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSipData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell component="th" scope="row">{row.month}</TableCell>
                    <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{formatCurrency(row.amount / row.count)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
    } else if (tabValue === 1) { // Demat
      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredDematData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
              <RechartsTooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Revenue' : name === 'newAccounts' ? 'New Accounts' : 'Total Accounts'
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="newAccounts" name="New Accounts" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'line') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredDematData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
              <RechartsTooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Revenue' : name === 'newAccounts' ? 'New Accounts' : 'Total Accounts'
              ]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="totalAccounts" name="Total Accounts" stroke="#ff7300" activeDot={{ r: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="newAccounts" name="New Accounts" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      } else { // Table view
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">New Accounts</TableCell>
                  <TableCell align="right">Total Accounts</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDematData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell component="th" scope="row">{row.month}</TableCell>
                    <TableCell align="right">{row.newAccounts}</TableCell>
                    <TableCell align="right">{row.totalAccounts}</TableCell>
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
    } else { // AUM
      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredAumData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <RechartsTooltip formatter={(value) => [formatCurrency(value)]} />
              <Legend />
              <Bar dataKey="equity" name="Equity" stackId="a" fill="#8884d8" />
              <Bar dataKey="debt" name="Debt" stackId="a" fill="#82ca9d" />
              <Bar dataKey="hybrid" name="Hybrid" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'line') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredAumData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <RechartsTooltip formatter={(value) => [formatCurrency(value)]} />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total AUM" stroke="#ff7300" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="equity" name="Equity" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="debt" name="Debt" stroke="#82ca9d" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="hybrid" name="Hybrid" stroke="#ffc658" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'pie') {
        const latestData = filteredAumData[filteredAumData.length - 1];
        const pieData = [
          { name: 'Equity', value: latestData.equity },
          { name: 'Debt', value: latestData.debt },
          { name: 'Hybrid', value: latestData.hybrid },
        ];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => [formatCurrency(value)]} />
            </PieChart>
          </ResponsiveContainer>
        );
      } else { // Table view
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Equity</TableCell>
                  <TableCell align="right">Debt</TableCell>
                  <TableCell align="right">Hybrid</TableCell>
                  <TableCell align="right">Total AUM</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAumData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell component="th" scope="row">{row.month}</TableCell>
                    <TableCell align="right">{formatCurrency(row.equity)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.debt)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.hybrid)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
    }
  };

  // Render team performance table
  const renderTeamPerformance = () => {
    if (!['top_management', 'business_head', 'rm_head'].includes(userRole)) {
      return null;
    }

    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Team Performance</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Member</TableCell>
                <TableCell align="right">Monthly SIP</TableCell>
                <TableCell align="right">Demat Accounts</TableCell>
                <TableCell align="right">AUM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamPerformanceData.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell align="right">{formatCurrency(row.sip)}</TableCell>
                  <TableCell align="right">{row.demat}</TableCell>
                  <TableCell align="right">{formatCurrency(row.aum)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Render asset allocation chart
  const renderAssetAllocation = () => {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={assetAllocationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {assetAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => [formatCurrency(value)]} />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Business Tracker
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Time Frame</InputLabel>
            <Select
              value={timeFrame}
              label="Time Frame"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="half-yearly">Half Yearly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* KPI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Monthly SIP
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totals.sipAmount)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {totals.sipGrowth >= 0 ? (
                  <>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                      {totals.sipGrowth.toFixed(2)}% from last month
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon color="error" />
                    <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                      {Math.abs(totals.sipGrowth).toFixed(2)}% from last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Demat Accounts
              </Typography>
              <Typography variant="h4" component="div">
                {totals.dematAccounts}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {totals.dematGrowth >= 0 ? (
                  <>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                      {totals.dematGrowth.toFixed(2)}% from last month
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon color="error" />
                    <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                      {Math.abs(totals.dematGrowth).toFixed(2)}% from last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Assets Under Management
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totals.aum)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {totals.aumGrowth >= 0 ? (
                  <>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                      {totals.aumGrowth.toFixed(2)}% from last month
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon color="error" />
                    <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                      {Math.abs(totals.aumGrowth).toFixed(2)}% from last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Chart Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="SIP" />
            <Tab label="Demat" />
            <Tab label="AUM" />
          </Tabs>
          <Box>
            <Tooltip title="Bar Chart">
              <IconButton 
                color={chartType === 'bar' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('bar')}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Line Chart">
              <IconButton 
                color={chartType === 'line' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('line')}
              >
                <TrendingUpIcon />
              </IconButton>
            </Tooltip>
            {tabValue === 2 && (
              <Tooltip title="Pie Chart">
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('pie')}
                >
                  <PieChartIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Table View">
              <IconButton 
                color={chartType === 'table' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('table')}
              >
                <TableChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ pt: 2 }}>
          {renderChart()}
        </Box>
      </Paper>

      {/* Team Performance (visible only to management roles) */}
      {renderTeamPerformance()}

      {/* Asset Allocation */}
      {renderAssetAllocation()}
    </Box>
  );
};

export default BusinessTracker;