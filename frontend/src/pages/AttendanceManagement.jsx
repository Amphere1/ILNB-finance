import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import attendanceService from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';

const AttendanceManagement = () => {
    const { user } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [outOfRangeLogins, setOutOfRangeLogins] = useState([]);
    const [openRegularizeDialog, setOpenRegularizeDialog] = useState(false);
    const [selectedLoginId, setSelectedLoginId] = useState(null);

    const isManager = user && (user.role === 'top_management' || user.role === 'business_head' || user.role === 'rm_head');

    const fetchAttendance = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            let data;
            if (isManager) {
                data = await attendanceService.getAllMonthlyReports(currentMonth, currentYear);
            } else {
                data = await attendanceService.getMyMonthlyReport(currentMonth, currentYear);
            }
            setAttendanceRecords(data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError(err.response?.data?.message || 'Failed to fetch attendance records.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOutOfRangeLogins = async () => {
        if (!isManager) return;
        try {
            const data = await attendanceService.getOutOfRangeLogins();
            setOutOfRangeLogins(data);
        } catch (err) {
            console.error('Error fetching out-of-range logins:', err);
            setError(err.response?.data?.message || 'Failed to fetch out-of-range logins.');
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchOutOfRangeLogins();
    }, [currentMonth, currentYear, user]);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude, accuracy } = position.coords;
                    await attendanceService.login(latitude, longitude, accuracy);
                    setMessage('Login recorded successfully!');
                    fetchAttendance(); // Refresh attendance data
                } catch (err) {
                    console.error('Error during login:', err);
                    setError(err.response?.data?.message || 'Failed to record login.');
                } finally {
                    setLoading(false);
                }
            }, (err) => {
                console.error('Geolocation error:', err);
                setError('Geolocation not available or permission denied.');
                setLoading(false);
            });
        } else {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await attendanceService.logout();
            setMessage('Logout recorded successfully!');
            fetchAttendance(); // Refresh attendance data
        } catch (err) {
            console.error('Error during logout:', err);
            setError(err.response?.data?.message || 'Failed to record logout.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegularizeClick = (loginId) => {
        setSelectedLoginId(loginId);
        setOpenRegularizeDialog(true);
    };

    const handleRegularizeConfirm = async () => {
        setOpenRegularizeDialog(false);
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await attendanceService.regularizeLogin(selectedLoginId);
            setMessage('Login regularized successfully!');
            fetchOutOfRangeLogins(); // Refresh out-of-range logins
            fetchAttendance(); // Refresh main attendance data
        } catch (err) {
            console.error('Error regularizing login:', err);
            setError(err.response?.data?.message || 'Failed to regularize login.');
        } finally {
            setLoading(false);
            setSelectedLoginId(null);
        }
    };

    const handleCloseRegularizeDialog = () => {
        setOpenRegularizeDialog(false);
        setSelectedLoginId(null);
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i); // Current year +/- 2

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Attendance Management</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Daily Actions</Typography>
                <Button variant="contained" onClick={handleLogin} disabled={loading} sx={{ mr: 2 }}>
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
                <Button variant="outlined" onClick={handleLogout} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Logout'}
                </Button>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Monthly Attendance Report</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={currentMonth}
                            label="Month"
                            onChange={(e) => setCurrentMonth(e.target.value)}
                        >
                            {months.map((month) => (
                                <MenuItem key={month} value={month}>{new Date(currentYear, month - 1, 1).toLocaleString('default', { month: 'long' })}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={currentYear}
                            label="Year"
                            onChange={(e) => setCurrentYear(e.target.value)}
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={fetchAttendance}>Generate Report</Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {isManager && <TableCell>Employee</TableCell>}
                                    <TableCell>Date</TableCell>
                                    <TableCell>Login Time</TableCell>
                                    <TableCell>Logout Time</TableCell>
                                    <TableCell>Hours Worked</TableCell>
                                    <TableCell>Out of Range</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendanceRecords.length === 0 ? (
                                    <TableRow><TableCell colSpan={isManager ? 6 : 5} align="center">No attendance records found for this period.</TableCell></TableRow>
                                ) : (
                                    isManager ? (
                                        attendanceRecords.map((userRecord) => (
                                            userRecord.dailyRecords.map((record, index) => (
                                                <TableRow key={`${userRecord.userId}-${record.date}-${index}`} sx={{ backgroundColor: record.isOutOfRange ? '#ffebee' : 'inherit' }}>
                                                    <TableCell>{userRecord.username}</TableCell>
                                                    <TableCell>{record.date}</TableCell>
                                                    <TableCell>{record.loginTime}</TableCell>
                                                    <TableCell>{record.logoutTime}</TableCell>
                                                    <TableCell>{record.hoursWorked}</TableCell>
                                                    <TableCell>{record.isOutOfRange ? 'Yes' : 'No'}</TableCell>
                                                </TableRow>
                                            ))
                                        ))
                                    ) : (
                                        attendanceRecords.dailyRecords?.map((record, index) => (
                                            <TableRow key={`${record.date}-${index}`} sx={{ backgroundColor: record.isOutOfRange ? '#ffebee' : 'inherit' }}>
                                                <TableCell>{record.date}</TableCell>
                                                <TableCell>{record.loginTime}</TableCell>
                                                <TableCell>{record.logoutTime}</TableCell>
                                                <TableCell>{record.hoursWorked}</TableCell>
                                                <TableCell>{record.isOutOfRange ? 'Yes' : 'No'}</TableCell>
                                            </TableRow>
                                        ))
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {isManager && outOfRangeLogins.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Out-of-Range Logins for Review</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Login Time</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {outOfRangeLogins.map((login) => (
                                    <TableRow key={login._id}>
                                        <TableCell>{login.user.username}</TableCell>
                                        <TableCell>{new Date(login.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(login.loginTime).toLocaleTimeString()}</TableCell>
                                        <TableCell>{`Lat: ${login.loginLocation.latitude.toFixed(4)}, Lon: ${login.loginLocation.longitude.toFixed(4)}`}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" size="small" onClick={() => handleRegularizeClick(login._id)}>
                                                Regularize
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Dialog
                open={openRegularizeDialog}
                onClose={handleCloseRegularizeDialog}
                aria-labelledby="regularize-dialog-title"
                aria-describedby="regularize-dialog-description"
            >
                <DialogTitle id="regularize-dialog-title">Confirm Regularization</DialogTitle>
                <DialogContent>
                    <DialogContentText id="regularize-dialog-description">
                        Are you sure you want to regularize this out-of-range login entry?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRegularizeDialog}>Cancel</Button>
                    <Button onClick={handleRegularizeConfirm} autoFocus>Regularize</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AttendanceManagement;