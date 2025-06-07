import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';

const RoleRequest = () => {
  const { user } = useAuth();
  const [requestedRole, setRequestedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRoleChange = (event) => {
    setRequestedRole(event.target.value);
  };

  const handleJustificationChange = (event) => {
    setJustification(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!requestedRole || !justification) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await userService.requestRoleUpgrade(requestedRole, justification);
      
      setSuccess(true);
      setRequestedRole('');
      setJustification('');
    } catch (err) {
      setError(err.message || 'Failed to submit role request');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'top_management':
        return 'Top Management';
      case 'business_head':
        return 'Business Head';
      case 'rm_head':
        return 'RM Head';
      case 'rm':
        return 'Relationship Manager';
      default:
        return role;
    }
  };

  // Determine which roles the user can request based on their current role
  const getAvailableRoles = () => {
    const roleHierarchy = ['rm', 'rm_head', 'business_head', 'top_management'];
    const currentRoleIndex = roleHierarchy.indexOf(user?.role);
    
    if (currentRoleIndex === -1 || currentRoleIndex === roleHierarchy.length - 1) {
      return [];
    }
    
    return roleHierarchy.slice(currentRoleIndex + 1);
  };

  const availableRoles = getAvailableRoles();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Request Role Upgrade
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Request an upgrade to a higher role. Your request will be reviewed by administrators.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Role: 
            <Chip 
              label={getRoleDisplayName(user?.role)} 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>

        {availableRoles.length === 0 ? (
          <Alert severity="info">
            You already have the highest role or your current role is not recognized.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your role upgrade request has been submitted successfully!
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel id="requested-role-label">Requested Role</InputLabel>
              <Select
                labelId="requested-role-label"
                value={requestedRole}
                label="Requested Role"
                onChange={handleRoleChange}
                disabled={loading}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              id="justification"
              label="Justification"
              name="justification"
              multiline
              rows={4}
              value={justification}
              onChange={handleJustificationChange}
              disabled={loading}
              placeholder="Please explain why you need this role upgrade and how it will help you perform your job better."
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading || !requestedRole || !justification}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RoleRequest;