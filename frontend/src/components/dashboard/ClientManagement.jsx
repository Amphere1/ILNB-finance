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
  Tabs,
  Tab,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Dummy data for clients
const initialClients = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 9876543210',
    category: 'Premium',
    relationshipManager: 'Amit Kumar',
    aum: '₹ 25,00,000',
    monthlySIP: '₹ 50,000',
    lastReview: '2023-09-15',
    nextReview: '2023-12-15',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 8765432109',
    category: 'Standard',
    relationshipManager: 'Neha Singh',
    aum: '₹ 10,00,000',
    monthlySIP: '₹ 25,000',
    lastReview: '2023-09-20',
    nextReview: '2023-12-20',
  },
  {
    id: 3,
    name: 'Amit Singh',
    email: 'amit.singh@example.com',
    phone: '+91 7654321098',
    category: 'Premium',
    relationshipManager: 'Rahul Verma',
    aum: '₹ 35,00,000',
    monthlySIP: '₹ 75,000',
    lastReview: '2023-09-25',
    nextReview: '2023-12-25',
  },
  {
    id: 4,
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91 6543210987',
    category: 'Premium Plus',
    relationshipManager: 'Amit Kumar',
    aum: '₹ 50,00,000',
    monthlySIP: '₹ 1,00,000',
    lastReview: '2023-10-01',
    nextReview: '2024-01-01',
  },
  {
    id: 5,
    name: 'Vikram Mehta',
    email: 'vikram.mehta@example.com',
    phone: '+91 5432109876',
    category: 'Premium Plus',
    relationshipManager: 'Neha Singh',
    aum: '₹ 75,00,000',
    monthlySIP: '₹ 1,50,000',
    lastReview: '2023-10-05',
    nextReview: '2024-01-05',
  },
  {
    id: 6,
    name: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    phone: '+91 4321098765',
    category: 'Standard',
    relationshipManager: 'Rahul Verma',
    aum: '₹ 8,00,000',
    monthlySIP: '₹ 20,000',
    lastReview: '2023-10-10',
    nextReview: '2024-01-10',
  },
  {
    id: 7,
    name: 'Rahul Joshi',
    email: 'rahul.joshi@example.com',
    phone: '+91 3210987654',
    category: 'Standard',
    relationshipManager: 'Amit Kumar',
    aum: '₹ 12,00,000',
    monthlySIP: '₹ 30,000',
    lastReview: '2023-10-15',
    nextReview: '2024-01-15',
  },
];

const ClientManagement = ({ userRole }) => {
  const [clients, setClients] = useState(initialClients);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    relationshipManager: '',
    aum: '',
    monthlySIP: '',
    lastReview: '',
    nextReview: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (client = null) => {
    if (client) {
      setCurrentClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        category: client.category,
        relationshipManager: client.relationshipManager,
        aum: client.aum,
        monthlySIP: client.monthlySIP,
        lastReview: client.lastReview,
        nextReview: client.nextReview,
      });
    } else {
      setCurrentClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'Standard',
        relationshipManager: '',
        aum: '',
        monthlySIP: '',
        lastReview: new Date().toISOString().split('T')[0],
        nextReview: '',
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
    if (currentClient) {
      // Update existing client
      setClients(clients.map(client => 
        client.id === currentClient.id ? { ...client, ...formData } : client
      ));
    } else {
      // Add new client
      const newClient = {
        id: clients.length + 1,
        ...formData,
      };
      setClients([...clients, newClient]);
    }
    handleCloseDialog();
  };

  const handleDeleteClient = (id) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Premium Plus': return 'error';
      case 'Premium': return 'warning';
      case 'Standard': return 'primary';
      default: return 'default';
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: getCategoryColor(params.row.category) }}>
            {params.row.name.charAt(0)}
          </Avatar>
          {params.row.name}
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 150 },
    { 
      field: 'category', 
      headerName: 'Category', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getCategoryColor(params.value)} 
          size="small" 
        />
      ),
    },
    { field: 'relationshipManager', headerName: 'RM', flex: 1, minWidth: 150 },
    { field: 'aum', headerName: 'AUM', flex: 1, minWidth: 120 },
    { field: 'monthlySIP', headerName: 'Monthly SIP', flex: 1, minWidth: 120 },
    { field: 'nextReview', headerName: 'Next Review', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Call">
            <IconButton size="small" color="primary">
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email">
            <IconButton size="small" color="primary">
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
              onClick={() => handleDeleteClient(params.row.id)}
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
          Client Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Client
        </Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="client category tabs">
          <Tab label="All Clients" />
          <Tab label="Premium Plus" />
          <Tab label="Premium" />
          <Tab label="Standard" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, height: 'calc(100vh - 300px)' }}>
        <DataGrid
          rows={tabValue === 0 ? clients : clients.filter(client => 
            tabValue === 1 ? client.category === 'Premium Plus' :
            tabValue === 2 ? client.category === 'Premium' :
            client.category === 'Standard'
          )}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          density="standard"
        />
      </Paper>

      {/* Add/Edit Client Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {currentClient 
              ? 'Update the client information below.'
              : 'Fill in the details to add a new client to the system.'}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  <MenuItem value="Premium Plus">Premium Plus</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Relationship Manager</InputLabel>
                <Select
                  name="relationshipManager"
                  value={formData.relationshipManager}
                  onChange={handleInputChange}
                  label="Relationship Manager"
                >
                  <MenuItem value="Amit Kumar">Amit Kumar</MenuItem>
                  <MenuItem value="Neha Singh">Neha Singh</MenuItem>
                  <MenuItem value="Rahul Verma">Rahul Verma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="aum"
                label="Assets Under Management (AUM)"
                value={formData.aum}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                placeholder="₹ 0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="monthlySIP"
                label="Monthly SIP"
                value={formData.monthlySIP}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                placeholder="₹ 0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastReview"
                label="Last Review Date"
                type="date"
                value={formData.lastReview}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nextReview"
                label="Next Review Date"
                type="date"
                value={formData.nextReview}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<PersonIcon />}>
            {currentClient ? 'Update Client' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientManagement;