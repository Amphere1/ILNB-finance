import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, TextField, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Switch, IconButton, Divider, Snackbar, Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO } from 'date-fns';
import { useAuth, AuthContext } from '../../contexts/AuthContext';
import companySettingsService from '../../services/companySettingsService';

const CompanySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    workStartTime: new Date(),
    workEndTime: new Date(),
    lateThresholdMinutes: 15,
    timezone: 'Asia/Kolkata'
  });
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: 100,
    isActive: true
  });
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Load company settings on component mount
  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      const data = await companySettingsService.getCompanySettings();
      setSettings(data);
      
      // Format time values for the time picker
      const startHour = data.workStartTime?.hour || 9;
      const startMinute = data.workStartTime?.minute || 0;
      const endHour = data.workEndTime?.hour || 18;
      const endMinute = data.workEndTime?.minute || 0;
      
      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0);
      
      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0);
      
      setGeneralSettings({
        companyName: data.companyName || 'ILNB Finance',
        workStartTime: startTime,
        workEndTime: endTime,
        lateThresholdMinutes: data.lateThresholdMinutes || 15,
        timezone: data.timezone || 'Asia/Kolkata'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company settings:', error);
      showSnackbar('Failed to load company settings', 'error');
      setLoading(false);
    }
  };

  // Save general company settings
  const saveGeneralSettings = async () => {
    try {
      setLoading(true);
      const updatedSettings = {
        companyName: generalSettings.companyName,
        workStartTime: {
          hour: generalSettings.workStartTime.getHours(),
          minute: generalSettings.workStartTime.getMinutes()
        },
        workEndTime: {
          hour: generalSettings.workEndTime.getHours(),
          minute: generalSettings.workEndTime.getMinutes()
        },
        lateThresholdMinutes: parseInt(generalSettings.lateThresholdMinutes),
        timezone: generalSettings.timezone
      };
      
      await companySettingsService.updateCompanySettings(updatedSettings);
      await fetchCompanySettings();
      showSnackbar('Company settings updated successfully', 'success');
    } catch (error) {
      console.error('Error saving company settings:', error);
      showSnackbar('Failed to update company settings', 'error');
      setLoading(false);
    }
  };

  // Handle location dialog open/close
  const handleOpenLocationDialog = (location = null) => {
    if (location) {
      setLocationData({
        name: location.name,
        address: location.address,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: location.radius,
        isActive: location.isActive
      });
      setEditingLocationId(location._id);
    } else {
      setLocationData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        radius: 100,
        isActive: true
      });
      setEditingLocationId(null);
    }
    setOpenLocationDialog(true);
  };

  const handleCloseLocationDialog = () => {
    setOpenLocationDialog(false);
  };

  // Handle location form submission
  const handleLocationSubmit = async () => {
    try {
      setLoading(true);
      const locationPayload = {
        ...locationData,
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        radius: parseInt(locationData.radius)
      };
      
      if (editingLocationId) {
        await companySettingsService.updateOfficeLocation(editingLocationId, locationPayload);
        showSnackbar('Office location updated successfully', 'success');
      } else {
        await companySettingsService.addOfficeLocation(locationPayload);
        showSnackbar('New office location added successfully', 'success');
      }
      
      handleCloseLocationDialog();
      await fetchCompanySettings();
    } catch (error) {
      console.error('Error saving location:', error);
      showSnackbar('Failed to save office location', 'error');
      setLoading(false);
    }
  };

  // Handle location deletion
  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this office location?')) {
      return;
    }
    
    try {
      setLoading(true);
      await companySettingsService.deleteOfficeLocation(locationId);
      await fetchCompanySettings();
      showSnackbar('Office location deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting location:', error);
      showSnackbar('Failed to delete office location', 'error');
      setLoading(false);
    }
  };

  // Handle input changes for location form
  const handleLocationInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocationData({
      ...locationData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle snackbar messages
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if user is admin (top_management)
  const isAdmin = user && user.role === 'top_management';

  if (loading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company Name"
              fullWidth
              value={generalSettings.companyName}
              onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Timezone"
              fullWidth
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
              disabled={!isAdmin}
              helperText="Example: Asia/Kolkata"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Work Start Time"
                value={generalSettings.workStartTime}
                onChange={(newValue) => setGeneralSettings({ ...generalSettings, workStartTime: newValue })}
                disabled={!isAdmin}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Work End Time"
                value={generalSettings.workEndTime}
                onChange={(newValue) => setGeneralSettings({ ...generalSettings, workEndTime: newValue })}
                disabled={!isAdmin}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Late Threshold (minutes)"
              type="number"
              fullWidth
              value={generalSettings.lateThresholdMinutes}
              onChange={(e) => setGeneralSettings({ ...generalSettings, lateThresholdMinutes: e.target.value })}
              disabled={!isAdmin}
              helperText="Minutes after work start time before marking as late"
            />
          </Grid>
        </Grid>
        
        {isAdmin && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveGeneralSettings}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save General Settings'}
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Office Locations
          </Typography>
          {isAdmin && (
            <Button 
              startIcon={<AddIcon />} 
              variant="contained" 
              onClick={() => handleOpenLocationDialog()}
            >
              Add Location
            </Button>
          )}
        </Box>

        {settings?.officeLocations && settings.officeLocations.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Coordinates</TableCell>
                  <TableCell>Radius (m)</TableCell>
                  <TableCell>Status</TableCell>
                  {isAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.officeLocations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.latitude}, {location.longitude}</TableCell>
                    <TableCell>{location.radius}</TableCell>
                    <TableCell>
                      {location.isActive ? (
                        <Typography color="primary">Active</Typography>
                      ) : (
                        <Typography color="text.secondary">Inactive</Typography>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenLocationDialog(location)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteLocation(location._id)}
                          aria-label="delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
            No office locations configured. {isAdmin && "Add your first office location."}
          </Typography>
        )}
      </Paper>

      {/* Location Dialog */}
      <Dialog open={openLocationDialog} onClose={handleCloseLocationDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingLocationId ? 'Edit Office Location' : 'Add New Office Location'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Location Name"
                fullWidth
                value={locationData.name}
                onChange={handleLocationInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={locationData.address}
                onChange={handleLocationInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="latitude"
                label="Latitude"
                fullWidth
                value={locationData.latitude}
                onChange={handleLocationInputChange}
                required
                type="number"
                inputProps={{ step: 'any', min: -90, max: 90 }}
                helperText="Value between -90 and 90"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="longitude"
                label="Longitude"
                fullWidth
                value={locationData.longitude}
                onChange={handleLocationInputChange}
                required
                type="number"
                inputProps={{ step: 'any', min: -180, max: 180 }}
                helperText="Value between -180 and 180"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="radius"
                label="Radius (meters)"
                fullWidth
                value={locationData.radius}
                onChange={handleLocationInputChange}
                required
                type="number"
                inputProps={{ min: 10 }}
                helperText="Minimum 10 meters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={locationData.isActive}
                    onChange={handleLocationInputChange}
                    color="primary"
                  />
                }
                label="Location Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLocationDialog}>Cancel</Button>
          <Button 
            onClick={handleLocationSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanySettings;
