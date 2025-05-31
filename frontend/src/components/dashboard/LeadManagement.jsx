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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Dummy data for leads
const initialLeads = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 9876543210',
    source: 'Referral',
    status: 'New',
    assignedTo: 'Amit Kumar',
    potentialValue: '₹ 5,00,000',
    createdAt: '2023-10-15',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 8765432109',
    source: 'Website',
    status: 'Contacted',
    assignedTo: 'Neha Singh',
    potentialValue: '₹ 3,50,000',
    createdAt: '2023-10-18',
  },
  {
    id: 3,
    name: 'Amit Singh',
    email: 'amit.singh@example.com',
    phone: '+91 7654321098',
    source: 'Social Media',
    status: 'Qualified',
    assignedTo: 'Rahul Verma',
    potentialValue: '₹ 7,50,000',
    createdAt: '2023-10-20',
  },
  {
    id: 4,
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91 6543210987',
    source: 'Event',
    status: 'Proposal',
    assignedTo: 'Amit Kumar',
    potentialValue: '₹ 10,00,000',
    createdAt: '2023-10-22',
  },
  {
    id: 5,
    name: 'Vikram Mehta',
    email: 'vikram.mehta@example.com',
    phone: '+91 5432109876',
    source: 'Cold Call',
    status: 'Negotiation',
    assignedTo: 'Neha Singh',
    potentialValue: '₹ 15,00,000',
    createdAt: '2023-10-25',
  },
  {
    id: 6,
    name: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    phone: '+91 4321098765',
    source: 'Partner',
    status: 'Closed Won',
    assignedTo: 'Rahul Verma',
    potentialValue: '₹ 8,00,000',
    createdAt: '2023-10-28',
  },
  {
    id: 7,
    name: 'Rahul Joshi',
    email: 'rahul.joshi@example.com',
    phone: '+91 3210987654',
    source: 'Webinar',
    status: 'Closed Lost',
    assignedTo: 'Amit Kumar',
    potentialValue: '₹ 6,00,000',
    createdAt: '2023-10-30',
  },
];

const LeadManagement = ({ userRole }) => {
  const [leads, setLeads] = useState(initialLeads);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New',
    assignedTo: '',
    potentialValue: '',
  });

  const handleOpenDialog = (lead = null) => {
    if (lead) {
      setCurrentLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        assignedTo: lead.assignedTo,
        potentialValue: lead.potentialValue,
      });
    } else {
      setCurrentLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'New',
        assignedTo: '',
        potentialValue: '',
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
    if (currentLead) {
      // Update existing lead
      setLeads(leads.map(lead => 
        lead.id === currentLead.id ? { ...lead, ...formData } : lead
      ));
    } else {
      // Add new lead
      const newLead = {
        id: leads.length + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLeads([...leads, newLead]);
    }
    handleCloseDialog();
  };

  const handleDeleteLead = (id) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'info';
      case 'Contacted': return 'primary';
      case 'Qualified': return 'secondary';
      case 'Proposal': return 'warning';
      case 'Negotiation': return 'warning';
      case 'Closed Won': return 'success';
      case 'Closed Lost': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 150 },
    { field: 'source', headerName: 'Source', flex: 1, minWidth: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)} 
          size="small" 
        />
      ),
    },
    { field: 'assignedTo', headerName: 'Assigned To', flex: 1, minWidth: 150 },
    { field: 'potentialValue', headerName: 'Potential Value', flex: 1, minWidth: 150 },
    { field: 'createdAt', headerName: 'Created Date', flex: 1, minWidth: 120 },
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
              onClick={() => handleDeleteLead(params.row.id)}
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
          Lead Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Lead
        </Button>
      </Paper>

      <Paper sx={{ p: 2, height: 'calc(100vh - 240px)' }}>
        <DataGrid
          rows={leads}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          density="standard"
        />
      </Paper>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {currentLead 
              ? 'Update the lead information below.'
              : 'Fill in the details to add a new lead to the system.'}
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
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  label="Source"
                >
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Cold Call">Cold Call</MenuItem>
                  <MenuItem value="Partner">Partner</MenuItem>
                  <MenuItem value="Webinar">Webinar</MenuItem>
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
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="Qualified">Qualified</MenuItem>
                  <MenuItem value="Proposal">Proposal</MenuItem>
                  <MenuItem value="Negotiation">Negotiation</MenuItem>
                  <MenuItem value="Closed Won">Closed Won</MenuItem>
                  <MenuItem value="Closed Lost">Closed Lost</MenuItem>
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
            <Grid item xs={12} sm={6}>
              <TextField
                name="potentialValue"
                label="Potential Value"
                value={formData.potentialValue}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                placeholder="₹ 0"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<AssignmentIcon />}>
            {currentLead ? 'Update Lead' : 'Add Lead'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadManagement;