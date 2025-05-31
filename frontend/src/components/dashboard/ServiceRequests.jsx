import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Dummy data for service requests
const initialServiceRequests = [
  {
    id: 1,
    title: 'Address Change Request',
    description: 'Need to update residential address in all investment accounts',
    client: 'Rajesh Sharma',
    requestType: 'Documentation',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Amit Kumar',
    createdDate: '2023-11-10',
    lastUpdated: '2023-11-10',
  },
  {
    id: 2,
    title: 'Bank Account Update',
    description: 'Update bank account details for SIP payments',
    client: 'Priya Patel',
    requestType: 'Banking',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Neha Singh',
    createdDate: '2023-11-08',
    lastUpdated: '2023-11-11',
  },
  {
    id: 3,
    title: 'Investment Statement Request',
    description: 'Need consolidated investment statement for tax filing',
    client: 'Amit Singh',
    requestType: 'Reporting',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Rahul Verma',
    createdDate: '2023-11-05',
    lastUpdated: '2023-11-09',
  },
  {
    id: 4,
    title: 'SIP Amount Change',
    description: 'Increase monthly SIP amount from ₹10,000 to ₹15,000',
    client: 'Neha Gupta',
    requestType: 'Transaction',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Amit Kumar',
    createdDate: '2023-11-12',
    lastUpdated: '2023-11-12',
  },
  {
    id: 5,
    title: 'Portfolio Rebalancing Request',
    description: 'Request for portfolio rebalancing as per new risk profile',
    client: 'Vikram Mehta',
    requestType: 'Advisory',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Neha Singh',
    createdDate: '2023-11-07',
    lastUpdated: '2023-11-10',
  },
  {
    id: 6,
    title: 'Nominee Addition',
    description: 'Add new nominee to all investment accounts',
    client: 'Anjali Desai',
    requestType: 'Documentation',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Rahul Verma',
    createdDate: '2023-11-03',
    lastUpdated: '2023-11-08',
  },
  {
    id: 7,
    title: 'Tax Saving Investment Advice',
    description: 'Need advice on tax saving investment options before year end',
    client: 'Rahul Joshi',
    requestType: 'Advisory',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Amit Kumar',
    createdDate: '2023-11-11',
    lastUpdated: '2023-11-11',
  },
];

const ServiceRequests = ({ userRole }) => {
  const [serviceRequests, setServiceRequests] = useState(initialServiceRequests);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    requestType: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: '',
  });

  const handleOpenDialog = (request = null) => {
    if (request) {
      setCurrentRequest(request);
      setFormData({
        title: request.title,
        description: request.description,
        client: request.client,
        requestType: request.requestType,
        priority: request.priority,
        status: request.status,
        assignedTo: request.assignedTo,
      });
    } else {
      setCurrentRequest(null);
      setFormData({
        title: '',
        description: '',
        client: '',
        requestType: '',
        priority: 'Medium',
        status: 'Open',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (currentRequest) {
      // Update existing request
      setServiceRequests(serviceRequests.map(request => 
        request.id === currentRequest.id ? { 
          ...request, 
          ...formData,
          lastUpdated: currentDate,
        } : request
      ));
    } else {
      // Add new request
      const newRequest = {
        id: serviceRequests.length + 1,
        ...formData,
        createdDate: currentDate,
        lastUpdated: currentDate,
      };
      setServiceRequests([...serviceRequests, newRequest]);
    }
    handleCloseDialog();
  };

  const handleDeleteRequest = (id) => {
    setServiceRequests(serviceRequests.filter(request => request.id !== id));
  };

  const handleUpdateStatus = (id, newStatus) => {
    const currentDate = new Date().toISOString().split('T')[0];
    setServiceRequests(serviceRequests.map(request => 
      request.id === id ? { 
        ...request, 
        status: newStatus,
        lastUpdated: currentDate,
      } : request
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <InfoIcon fontSize="small" />;
      case 'In Progress': return <WarningIcon fontSize="small" />;
      case 'Resolved': return <CheckCircleIcon fontSize="small" />;
      case 'Closed': return <ErrorIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Open': return 0;
      case 'In Progress': return 1;
      case 'Resolved': return 2;
      case 'Closed': return 3;
      default: return 0;
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'client', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'requestType', headerName: 'Type', flex: 1, minWidth: 120 },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPriorityColor(params.value)} 
          size="small" 
        />
      ),
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <Chip 
          icon={getStatusIcon(params.value)}
          label={params.value} 
          color={getStatusColor(params.value)} 
          size="small" 
        />
      ),
    },
    { field: 'assignedTo', headerName: 'Assigned To', flex: 1, minWidth: 150 },
    { field: 'lastUpdated', headerName: 'Last Updated', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {params.row.status !== 'Resolved' && params.row.status !== 'Closed' && (
            <Tooltip title="Mark as Resolved">
              <IconButton 
                size="small" 
                color="success"
                onClick={() => handleUpdateStatus(params.row.id, 'Resolved')}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              color="secondary"
              onClick={() => handleOpenDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteRequest(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Service Requests
        </Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Table View' : 'Card View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Service Request
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4" component="div">
                  {serviceRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Open
                </Typography>
                <Typography variant="h4" component="div" color="info.main">
                  {serviceRequests.filter(req => req.status === 'Open').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {serviceRequests.filter(req => req.status === 'In Progress').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {serviceRequests.filter(req => req.status === 'Resolved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'table' ? (
        <Paper sx={{ p: 2, height: 'calc(100vh - 350px)' }}>
          <DataGrid
            rows={serviceRequests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            density="standard"
          />
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {serviceRequests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {request.title}
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(request.status)}
                      label={request.status} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {request.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Stepper activeStep={getStatusStep(request.status)} alternativeLabel>
                      <Step>
                        <StepLabel>Open</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>In Progress</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Resolved</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Closed</StepLabel>
                      </Step>
                    </Stepper>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          Client: {request.client}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={request.priority} 
                          color={getPriorityColor(request.priority)} 
                          size="small" 
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SupportIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.requestType}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.lastUpdated}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {request.assignedTo.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {request.assignedTo}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  {request.status !== 'Resolved' && request.status !== 'Closed' && (
                    <Button 
                      size="small" 
                      startIcon={<CheckCircleIcon />} 
                      color="success"
                      onClick={() => handleUpdateStatus(request.id, 'Resolved')}
                    >
                      Resolve
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />} 
                    onClick={() => handleOpenDialog(request)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />} 
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Service Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentRequest ? 'Edit Service Request' : 'New Service Request'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {currentRequest 
              ? 'Update the service request information below.'
              : 'Fill in the details to create a new service request.'}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Request Title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="client"
                label="Client Name"
                value={formData.client}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Request Type</InputLabel>
                <Select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleInputChange}
                  label="Request Type"
                >
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Banking">Banking</MenuItem>
                  <MenuItem value="Reporting">Reporting</MenuItem>
                  <MenuItem value="Transaction">Transaction</MenuItem>
                  <MenuItem value="Advisory">Advisory</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  label="Assigned To"
                >
                  <MenuItem value="Amit Kumar">Amit Kumar</MenuItem>
                  <MenuItem value="Neha Singh">Neha Singh</MenuItem>
                  <MenuItem value="Rahul Verma">Rahul Verma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<SupportIcon />}>
            {currentRequest ? 'Update Request' : 'Create Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceRequests;