import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Support as SupportIcon,
  BarChart as BarChartIcon,
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';

// Dashboard components
import Overview from '../components/dashboard/Overview';
import LeadManagement from '../components/dashboard/LeadManagement';
import ClientManagement from '../components/dashboard/ClientManagement';
import TaskManagement from '../components/dashboard/TaskManagement';
import ServiceRequests from '../components/dashboard/ServiceRequests';
import BusinessTracker from '../components/dashboard/BusinessTracker';
import InvestmentReview from '../components/dashboard/InvestmentReview';

const drawerWidth = 240;

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Leads', icon: <PeopleIcon />, path: '/dashboard/leads' },
      { text: 'Clients', icon: <PeopleIcon />, path: '/dashboard/clients' },
      { text: 'Tasks', icon: <AssignmentIcon />, path: '/dashboard/tasks' },
      { text: 'Service Requests', icon: <SupportIcon />, path: '/dashboard/service-requests' },
    ];
    
    // Add role-specific items
    if (user?.role === 'top_management' || user?.role === 'business_head' || user?.role === 'rm_head') {
      baseItems.push(
        { text: 'Business Tracker', icon: <BarChartIcon />, path: '/dashboard/business-tracker' },
        { text: 'Investment Review', icon: <CalendarIcon />, path: '/dashboard/investment-review' }
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
    return null; // Or a loading spinner
  }

  return (
    <Box sx={{ display: 'flex' }}>
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
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' ? 'Dashboard Overview' :
             location.pathname === '/dashboard/leads' ? 'Lead Management' :
             location.pathname === '/dashboard/clients' ? 'Client Management' :
             location.pathname === '/dashboard/tasks' ? 'Task Management' :
             location.pathname === '/dashboard/service-requests' ? 'Service Requests' :
             location.pathname === '/dashboard/business-tracker' ? 'Business Tracker' :
             location.pathname === '/dashboard/investment-review' ? 'Investment Review' : 'Dashboard'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="large"
                edge="end"
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
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
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">
                {user?.name || 'User'} ({user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})
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
          <Route path="/" element={<Overview userRole={user?.role} />} />
          <Route path="/leads" element={<LeadManagement userRole={user?.role} />} />
          <Route path="/clients" element={<ClientManagement userRole={user?.role} />} />
          <Route path="/tasks" element={<TaskManagement userRole={user?.role} />} />
          <Route path="/service-requests" element={<ServiceRequests userRole={user?.role} />} />
          <Route path="/business-tracker" element={<BusinessTracker userRole={user?.role} />} />
          <Route path="/investment-review" element={<InvestmentReview userRole={user?.role} />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;