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
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';

const RoleRequestManagement = () => {
  const { hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [processSuccess, setProcessSuccess] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  // Only top management can access this page
  const isAuthorized = hasRole(['top_management']);

  useEffect(() => {
    const fetchRoleRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getRoleRequests();
        setRequests(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch role requests');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchRoleRequests();
    }
  }, [isAuthorized]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
    setDialogOpen(true);
    setProcessError(null);
    setProcessSuccess(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
    setComment('');
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !actionType) {
      handleCloseDialog();
      return;
    }

    try {
      setProcessLoading(true);
      setProcessError(null);
      setProcessSuccess(false);

      const approved = actionType === 'approve';
      await userService.processRoleRequest(selectedRequest._id, approved, comment);
      
      // Update the request in the local state
      setRequests(requests.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: approved ? 'approved' : 'rejected', adminComment: comment } 
          : req
      ));
      
      setProcessSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setProcessError(err.message || 'Failed to process role request');
    } finally {
      setProcessLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
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
        Role Upgrade Requests
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Review and manage role upgrade requests from users.
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
        ) : requests.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No role upgrade requests found.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Current Role</TableCell>
                    <TableCell>Requested Role</TableCell>
                    <TableCell>Justification</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow hover key={request._id}>
                        <TableCell>{request.user ? request.user.username : 'Unknown User'}</TableCell>
                        <TableCell>{getRoleDisplayName(request.currentRole)}</TableCell>
                        <TableCell>{getRoleDisplayName(request.requestedRole)}</TableCell>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 200 }}>
                            {request.justification}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status.toUpperCase()} 
                            color={getStatusColor(request.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                onClick={() => handleOpenDialog(request, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleOpenDialog(request, 'reject')}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={requests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Role Upgrade Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve' 
              ? `Are you sure you want to approve the role upgrade request from ${selectedRequest?.user?.username || 'this user'}?` 
              : `Are you sure you want to reject the role upgrade request from ${selectedRequest?.user?.username || 'this user'}?`}
          </DialogContentText>
          {processError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {processError}
            </Alert>
          )}
          {processSuccess && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Request {actionType === 'approve' ? 'approved' : 'rejected'} successfully!
            </Alert>
          )}
          <TextField
            margin="dense"
            id="comment"
            label="Comment (Optional)"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={handleCommentChange}
            disabled={processLoading}
            placeholder={actionType === 'approve' 
              ? "Add any additional information or instructions for the user" 
              : "Explain why the request was rejected"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={processLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcessRequest} 
            color={actionType === 'approve' ? "success" : "error"} 
            disabled={processLoading}
          >
            {processLoading ? <CircularProgress size={24} /> : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleRequestManagement;