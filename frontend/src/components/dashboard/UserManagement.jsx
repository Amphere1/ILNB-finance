import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

const UserManagement = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Only top management can access this page
  const isAuthorized = hasRole('top_management');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleRoleChange = (event) => {
    setNewRole(event.target.value);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      handleCloseDialog();
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await userService.updateUserRole(selectedUser._id, { role: newRole });
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      
      setUpdateSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update user role');
    } finally {
      setUpdateLoading(false);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'top_management':
        return 'error';
      case 'business_head':
        return 'warning';
      case 'rm_head':
        return 'info';
      case 'rm':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage user roles and permissions. Only top management can change user roles.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow hover key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getRoleDisplayName(user.role)} 
                            color={getRoleColor(user.role)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.CreatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                          >
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update role for user: {selectedUser?.username}
          </DialogContentText>
          {updateError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {updateError}
            </Alert>
          )}
          {updateSuccess && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Role updated successfully!
            </Alert>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newRole}
              label="Role"
              onChange={handleRoleChange}
              disabled={updateLoading}
            >
              <MenuItem value="rm">Relationship Manager</MenuItem>
              <MenuItem value="rm_head">RM Head</MenuItem>
              <MenuItem value="business_head">Business Head</MenuItem>
              <MenuItem value="top_management">Top Management</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            color="primary" 
            disabled={updateLoading || newRole === selectedUser?.role}
          >
            {updateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;