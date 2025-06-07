import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Badge, IconButton, Divider, Chip, Tooltip, CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../services/attendanceService';
import companySettingsService from '../../services/companySettingsService';

const NotificationsPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let notifs = [];
      
      // If user is a manager, fetch out-of-range and late logins
      if (user && ['top_management', 'business_head', 'rm_head'].includes(user.role)) {
        const outOfRangeData = await attendanceService.getOutOfRangeLogins();
        
        // Convert out-of-range logins to notifications
        outOfRangeData.forEach(login => {
          notifs.push({
            id: `or-${login._id}`,
            type: 'out-of-range',
            title: 'Out of Range Login',
            message: `${login.user.username} logged in from outside office range on ${format(new Date(login.date), 'MMM dd, yyyy')}`,
            timestamp: new Date(login.loginTime),
            status: login.regularized ? 'approved' : 'pending',
            data: login
          });
        });
        
        // If user is top management, also fetch info about office locations
        if (user.role === 'top_management') {
          const officeLocations = await companySettingsService.getOfficeLocations();
          
          if (officeLocations && officeLocations.length === 0) {
            notifs.push({
              id: 'no-locations',
              type: 'system',
              title: 'No Office Locations',
              message: 'You have not configured any office locations. Add your office locations to enable accurate attendance tracking.',
              timestamp: new Date(),
              status: 'alert',
              data: null
            });
          }
        }
      }
      
      // Sort by timestamp, most recent first
      notifs.sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Mark a notification as read or handled
  const handleNotification = async (notification) => {
    try {
      if (notification.type === 'out-of-range') {
        await attendanceService.regularizeLogin(notification.data._id);
      }
      
      // Remove from the UI
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };
  
  // Get the icon for the notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'out-of-range':
        return <LocationIcon color="warning" />;
      case 'late-login':
        return <TimeIcon color="info" />;
      case 'system':
        return <WarningIcon color="error" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };
  
  // Get the status chip for the notification
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip size="small" label="Pending" color="warning" />;
      case 'approved':
        return <Chip size="small" label="Approved" color="success" />;
      case 'alert':
        return <Chip size="small" label="Action Required" color="error" />;
      default:
        return null;
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={notifications.filter(n => n.status === 'pending' || n.status === 'alert').length} 
            color="error"
            sx={{ mr: 1 }}
          >
            <NotificationsIcon color="primary" />
          </Badge>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Tooltip title="Refresh">
          <IconButton onClick={fetchNotifications} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length > 0 ? (
        <List dense>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                secondaryAction={
                  notification.status !== 'approved' && (
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => handleNotification(notification)}
                    >
                      {notification.status === 'pending' ? <CheckIcon /> : <CloseIcon />}
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{notification.title}</Typography>
                      {getStatusChip(notification.status)}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(notification.timestamp, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No notifications to display
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default NotificationsPanel;
