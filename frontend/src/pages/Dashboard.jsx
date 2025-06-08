import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  SupportAgent as SupportAgentIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  UpgradeOutlined as UpgradeIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import HrTopbarSection from '../components/dashboard/HrTopbarSection';

// Components
import Overview from '../components/dashboard/Overview';
import LeadManagement from '../components/dashboard/LeadManagement';
import ClientManagement from '../components/dashboard/ClientManagement';
import TaskManagement from '../components/dashboard/TaskManagement';
import ServiceRequests from '../components/dashboard/ServiceRequests';
import BusinessTracker from '../components/dashboard/BusinessTracker';
import InvestmentReview from '../components/dashboard/InvestmentReview';
import UserManagement from '../components/dashboard/UserManagement';
import RoleRequest from '../components/dashboard/RoleRequest';
import RoleRequestManagement from '../components/dashboard/RoleRequestManagement';
import AttendanceManagement from '../pages/AttendanceManagement'; // Import AttendanceManagement
import CompanySettings from '../components/dashboard/CompanySettings'; // Import CompanySettings
import SpoofTester from '../components/dashboard/SpoofTester'; // Import SpoofTester
import RoleBasedRoute from '../components/RoleBasedRoute';
import { useAuth } from '../contexts/AuthContext';
import * as userService from '../services/userService';
import NotFound from './NotFound'; // Import NotFound component

import CreateSubordinateForm from './AddSubordinate';
import LeaveHistory from './AllLeaves';
import MyLeaveHistory from './LeaveHistory';
import ChangePasswordForm from './ChangePass';
import EmployeeDirectory from './Employee';
import ApplyLeaveForm from './ApplyLeave';
import ManagerLeaveApprovals from './ManagerApproval';
import MyProfile from './MyProfile';
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingRoleRequests, setPendingRoleRequests] = useState(0);
  
  // Use the auth context
  const { user, logout, hasRole } = useAuth();

  // Fetch pending role requests count
  useEffect(() => {
    const fetchPendingRoleRequests = async () => {
      if (hasRole(['top_management'])) {
        try {
          const count = await userService.getPendingRoleRequestsCount();
          setPendingRoleRequests(count);
        } catch (error) {
          console.error('Failed to fetch pending role requests:', error);
        }
      }
    };

    fetchPendingRoleRequests();

    // Refresh count every 5 minutes
    const intervalId = setInterval(fetchPendingRoleRequests, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [hasRole]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Leads', icon: <PersonAddIcon />, path: '/dashboard/leads' },
      { text: 'Clients', icon: <PeopleIcon />, path: '/dashboard/clients' },
      { text: 'Tasks', icon: <AssignmentIcon />, path: '/dashboard/tasks' },
      { text: 'Service Requests', icon: <SupportAgentIcon />, path: '/dashboard/service-requests' },
      { text: 'Request Role Upgrade', icon: <UpgradeIcon />, path: '/dashboard/role-request' },
      { text: 'Attendance', icon: <PeopleIcon />, path: 'attendance' }, // Changed path to relative
    ];
    
    // Add role-specific items
    if (hasRole(['top_management', 'business_head', 'rm_head'])) {
      baseItems.push(
        { text: 'Business Tracker', icon: <BarChartIcon />, path: '/dashboard/business-tracker' }
      );
    }
    
    if (hasRole(['top_management', 'business_head'])) {
      baseItems.push(
        { text: 'Investment Review', icon: <AssessmentIcon />, path: '/dashboard/investment-review' }
      );
    }

    // Add admin-only items
    if (hasRole(['top_management'])) {
      baseItems.push(
        { text: 'User Management', icon: <AdminPanelSettingsIcon />, path: '/dashboard/user-management' },
        { 
          text: 'Role Requests', 
          icon: pendingRoleRequests > 0 ? 
            <Badge color="error" variant="dot">
              <UpgradeIcon />
            </Badge> : 
            <UpgradeIcon />, 
          path: '/dashboard/role-requests' 
        },
        { text: 'Company Settings', icon: <SettingsIcon />, path: '/dashboard/company-settings' },
        { text: 'Spoof Tester', icon: <LocationOnIcon />, path: '/dashboard/spoof-tester' }
      );
    }
    
    return baseItems;
  };
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" noWrap component="div">
          ILNB Finance CRM
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavigationItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  if (!user) {
    return null; // Auth context will handle redirection
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' ? 'Dashboard Overview' :
             location.pathname === '/dashboard/leads' ? 'Lead Management' :
             location.pathname === '/dashboard/clients' ? 'Client Management' :
             location.pathname === '/dashboard/tasks' ? 'Task Management' :
             location.pathname === '/dashboard/service-requests' ? 'Service Requests' :
             location.pathname === '/dashboard/business-tracker' ? 'Business Tracker' :
             location.pathname === '/dashboard/investment-review' ? 'Investment Review' : 'Dashboard'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HrTopbarSection user={user} />
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="large"
                edge="end"
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">
                {user?.name || user?.email || 'User'} ({user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* This is for spacing below the AppBar */}
        
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/leads" element={<LeadManagement />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/service-requests" element={<ServiceRequests />} />
          <Route path="/role-request" element={<RoleRequest />} />
          <Route path="attendance" element={<AttendanceManagement />} /> {/* Added AttendanceManagement route */}
          <Route
              path="business-tracker"
              element={
                <RoleBasedRoute allowedRoles={['top_management', 'business_head', 'rm_head']}>
                    <BusinessTracker />
                </RoleBasedRoute>
              }
          />
          <Route
              path="investment-review"
              element={
                <RoleBasedRoute allowedRoles={['top_management', 'business_head']}>
                    <InvestmentReview />
                </RoleBasedRoute>
              }
          />
          <Route
              path="user-management"
              element={
                <RoleBasedRoute allowedRoles={['top_management']}>
                    <UserManagement />
                </RoleBasedRoute>
              }
          />
          <Route
              path="role-requests"
              element={
                <RoleBasedRoute requiredRoles={['top_management']}>
                    <RoleRequestManagement />
                </RoleBasedRoute>
              }
          />
          <Route
              path="company-settings"
              element={
                <RoleBasedRoute allowedRoles={['top_management']}>
                    <CompanySettings />
                </RoleBasedRoute>
              }
          />
          <Route
              path="spoof-tester"
              element={
                <RoleBasedRoute allowedRoles={['top_management']}>
                    <SpoofTester />
                </RoleBasedRoute>
              }
          />          {/* HR Routes */}
          <Route path="apply-leave" element={<ApplyLeaveForm />} />
          <Route path="leave-history" element={<MyLeaveHistory />} />
          <Route path="all-leaves" element={<LeaveHistory />} />
          <Route path="approvals" element={<ManagerLeaveApprovals />} />
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="add-subordinate" element={<CreateSubordinateForm />} />
          <Route path="change-password" element={<ChangePasswordForm />} />
          <Route path="my-profile" element={<MyProfile />} />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
          {/* Fallback route */}
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;