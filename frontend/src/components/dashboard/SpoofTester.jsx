import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField,
  CircularProgress, Alert
} from '@mui/material';
import attendanceService from '../../services/attendanceService';

const SpoofTester = () => {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
    accuracy: '10'
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCoordinates({
      ...coordinates,
      [name]: value
    });
  };

  const handleGetCurrentLocation = () => {
    setError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            accuracy: position.coords.accuracy.toString()
          });
        },
        (err) => {
          setError(`Error getting location: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleTestSpoof = async () => {
    try {
      setLoading(true);
      setError('');
      setTestResult(null);

      const payload = {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
        accuracy: parseFloat(coordinates.accuracy)
      };

      const result = await attendanceService.testSpoofDetection(payload);
      setTestResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error testing spoof detection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        GPS Spoof Detection Tester
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This tool allows testing of the GPS spoofing detection system with specific coordinates.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Latitude"
              name="latitude"
              value={coordinates.latitude}
              onChange={handleInputChange}
              fullWidth
              type="number"
              inputProps={{ step: 'any' }}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Longitude"
              name="longitude"
              value={coordinates.longitude}
              onChange={handleInputChange}
              fullWidth
              type="number"
              inputProps={{ step: 'any' }}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Accuracy (meters)"
              name="accuracy"
              value={coordinates.accuracy}
              onChange={handleInputChange}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={handleGetCurrentLocation}
          >
            Get Current Location
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTestSpoof}
            disabled={loading || !coordinates.latitude || !coordinates.longitude}
          >
            {loading ? <CircularProgress size={24} /> : 'Test Location'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {testResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Spoofing Detection</Typography>
            <Alert severity={testResult.spoofing.detected ? "error" : "success"} sx={{ mb: 1 }}>
              {testResult.spoofing.detected 
                ? `GPS spoofing detected! Reason: ${testResult.spoofing.reason}` 
                : 'No GPS spoofing detected'}
            </Alert>
          </Box>
          
          <Box>
            <Typography variant="subtitle1">Location Validation</Typography>
            <Alert severity={testResult.location.outOfRange ? "warning" : "success"}>
              {testResult.location.outOfRange 
                ? 'Location is outside of all office allowed ranges' 
                : 'Location is within an allowed office range'}
            </Alert>
            
            {testResult.location.closestOffice && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Closest Office:</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {testResult.location.closestOffice.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Distance:</strong> {testResult.location.closestOffice.distance} meters
                </Typography>
                <Typography variant="body2">
                  <strong>Allowed Radius:</strong> {testResult.location.closestOffice.radius} meters
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SpoofTester;
