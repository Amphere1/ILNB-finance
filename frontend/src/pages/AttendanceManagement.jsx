import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, InputLabel, FormControl, Chip, Tooltip } from '@mui/material';
import { InfoOutlined, VisibilityOff } from '@mui/icons-material';
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

    const isManager = user && (user.role === 'top_management' || user.role === 'business_head' || user.role === 'rm_head');    // Admin privileges check
    const isAdmin = user && user.role === 'top_management';
    
    // Define role hierarchy for UI display and access control
    const roleHierarchy = {
        'top_management': { level: 4, label: 'Top Management', color: '#8c1aff' },
        'business_head': { level: 3, label: 'Business Head', color: '#2196f3' },
        'rm_head': { level: 2, label: 'RM Head', color: '#4caf50' },
        'rm': { level: 1, label: 'RM', color: '#ff9800' }
    };

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
    };    useEffect(() => {
        const getAttendanceData = async () => {
            await fetchAttendance();
            if (isManager) {
                await fetchOutOfRangeLogins();
            }
        };
        
        getAttendanceData();
    // These are the only dependencies we want to trigger a refresh on
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, currentYear, user?.id]);

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

    return (        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Attendance Management</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlined />
                    <Typography variant="body1">
                        <strong>Hierarchical Access System:</strong> {isManager 
                            ? "You can only view and manage attendance records for users at or below your role level." 
                            : "Your attendance records can only be viewed by your managers and higher role levels."}
                    </Typography>
                </Box>
                {isManager && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {Object.entries(roleHierarchy)
                            .sort((a, b) => b[1].level - a[1].level)
                            .map(([role, details]) => (
                                <Chip
                                    key={role}
                                    label={`${details.label} (Level ${details.level})`}
                                    size="small"
                                    sx={{ 
                                        bgcolor: details.color,
                                        color: 'white',
                                        opacity: roleHierarchy[user.role].level >= details.level ? 1 : 0.5
                                    }}
                                />
                            ))}
                    </Box>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>                    <strong>Your role:</strong> {roleHierarchy[user.role]?.label || user.role} 
                    {user.role !== 'top_management' && (
                        <> - Your records are visible to: {Object.entries(roleHierarchy)
                            .filter(entry => entry[1].level > roleHierarchy[user.role].level)
                            .map(entry => entry[1].label)
                            .join(', ')}</>
                    )}
                </Typography>
            </Paper>

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
                        <Table>                            <TableHead>
                                <TableRow>
                                    {isManager && (
                                        <TableCell>
                                            Employee 
                                            <Tooltip title="Based on your role, you can only view detailed information for employees at or below your role level">
                                                <InfoOutlined fontSize="small" sx={{ ml: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                    <TableCell>Date</TableCell>
                                    <TableCell>Login Time</TableCell>
                                    <TableCell>Logout Time</TableCell>
                                    <TableCell>Hours Worked</TableCell>
                                    <TableCell>
                                        Status
                                        <Tooltip title="Indicates if login was out of range or late">
                                            <InfoOutlined fontSize="small" sx={{ ml: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendanceRecords.length === 0 ? (
                                    <TableRow><TableCell colSpan={isManager ? 6 : 5} align="center">No attendance records found for this period.</TableCell></TableRow>
                                ) : (                                    isManager ? (
                                        attendanceRecords.map((userRecord) => {
                                            const userRole = userRecord.role || 'rm';
                                            const canView = user.role === 'top_management' || 
                                                           (roleHierarchy[user.role]?.level >= roleHierarchy[userRole]?.level);
                                            
                                            return userRecord.dailyRecords.map((record, index) => (
                                                <TableRow 
                                                    key={`${userRecord.userId}-${record.date}-${index}`} 
                                                    sx={{ 
                                                        backgroundColor: record.isOutOfRange 
                                                            ? '#ffebee' 
                                                            : (record.isLate ? '#fff9c4' : 'inherit'),
                                                        opacity: canView ? 1 : 0.5
                                                    }}
                                                >
                                                    <TableCell>
                                                        {userRecord.username}
                                                        {userRole && (
                                                            <Tooltip title={roleHierarchy[userRole]?.label || userRole}>
                                                                <Chip 
                                                                    size="small" 
                                                                    label={userRole} 
                                                                    sx={{ 
                                                                        ml: 1, 
                                                                        bgcolor: roleHierarchy[userRole]?.color || '#grey',
                                                                        color: 'white'
                                                                    }} 
                                                                />
                                                            </Tooltip>
                                                        )}
                                                        {!canView && (
                                                            <Tooltip title="Limited view due to role hierarchy">
                                                                <VisibilityOff fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{canView ? record.date : '***'}</TableCell>
                                                    <TableCell>{canView ? record.loginTime : '***'}</TableCell>
                                                    <TableCell>{canView ? record.logoutTime : '***'}</TableCell>
                                                    <TableCell>{canView ? record.hoursWorked : '***'}</TableCell>                                                    <TableCell>
                                                        {canView ? (
                                                            <Box>
                                                                {record.isOutOfRange && (
                                                                    <Chip 
                                                                        label="Out of Range" 
                                                                        size="small" 
                                                                        color="error" 
                                                                        variant="outlined"
                                                                        sx={{ mr: 0.5 }} 
                                                                    />
                                                                )}
                                                                {record.isLate && (
                                                                    <Chip 
                                                                        label={`Late ${record.lateMinutes}m`} 
                                                                        size="small" 
                                                                        color="warning" 
                                                                        variant="outlined" 
                                                                    />
                                                                )}
                                                                {!record.isOutOfRange && !record.isLate && "OK"}
                                                            </Box>
                                                        ) : '***'}
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })
                                    ) : (                                        attendanceRecords.dailyRecords?.map((record, index) => (
                                            <TableRow key={`${record.date}-${index}`} sx={{ 
                                                backgroundColor: record.isOutOfRange 
                                                    ? '#ffebee' 
                                                    : (record.isLate ? '#fff9c4' : 'inherit')
                                            }}>
                                                <TableCell>{record.date}</TableCell>
                                                <TableCell>{record.loginTime}</TableCell>
                                                <TableCell>{record.logoutTime}</TableCell>
                                                <TableCell>{record.hoursWorked}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        {record.isOutOfRange && (
                                                            <Chip 
                                                                label="Out of Range" 
                                                                size="small" 
                                                                color="error" 
                                                                variant="outlined"
                                                                sx={{ mr: 0.5 }} 
                                                            />
                                                        )}
                                                        {record.isLate && (
                                                            <Chip 
                                                                label={`Late ${record.lateMinutes}m`} 
                                                                size="small" 
                                                                color="warning" 
                                                                variant="outlined" 
                                                            />
                                                        )}
                                                        {!record.isOutOfRange && !record.isLate && "OK"}
                                                    </Box>
                                                </TableCell>
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
                            <TableBody>                                {outOfRangeLogins.map((login) => {
                                    const userRole = login.user.role || 'rm';
                                    const canView = user.role === 'top_management' || 
                                                   (roleHierarchy[user.role]?.level >= roleHierarchy[userRole]?.level);
                                    const canRegularize = canView; // Only allow regularization if you can view

                                    return (
                                        <TableRow 
                                            key={login._id}
                                            sx={{ 
                                                opacity: canView ? 1 : 0.5,
                                                backgroundColor: !canView ? '#f5f5f5' : 'inherit'
                                            }}
                                        >
                                            <TableCell>
                                                {login.user.username}
                                                {userRole && (
                                                    <Tooltip title={roleHierarchy[userRole]?.label || userRole}>
                                                        <Chip 
                                                            size="small" 
                                                            label={userRole}
                                                            sx={{ 
                                                                ml: 1, 
                                                                bgcolor: roleHierarchy[userRole]?.color || '#grey',
                                                                color: 'white'
                                                            }} 
                                                        />
                                                    </Tooltip>
                                                )}
                                                {!canView && (
                                                    <Tooltip title="Cannot view or modify due to role hierarchy">
                                                        <InfoOutlined fontSize="small" sx={{ ml: 1, color: 'warning.main' }} />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>{canView ? new Date(login.date).toLocaleDateString() : '***'}</TableCell>
                                            <TableCell>{canView ? new Date(login.loginTime).toLocaleTimeString() : '***'}</TableCell>
                                            <TableCell>
                                                {canView ? `Lat: ${login.loginLocation.latitude.toFixed(4)}, Lon: ${login.loginLocation.longitude.toFixed(4)}` : '***'}
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={() => handleRegularizeClick(login._id)}
                                                    disabled={!canRegularize}
                                                >
                                                    Regularize
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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