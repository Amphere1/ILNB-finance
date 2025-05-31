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
  Card,
  CardContent,
  CardActions,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Dummy data for tasks
const initialTasks = [
  {
    id: 1,
    title: 'Follow up with Rajesh Sharma',
    description: 'Call to discuss investment options for new funds',
    dueDate: '2023-11-15',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Amit Kumar',
    relatedTo: 'Rajesh Sharma',
    relatedToType: 'Client',
  },
  {
    id: 2,
    title: 'Send investment proposal to Priya Patel',
    description: 'Prepare and send the investment proposal as discussed',
    dueDate: '2023-11-16',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Neha Singh',
    relatedTo: 'Priya Patel',
    relatedToType: 'Client',
  },
  {
    id: 3,
    title: 'Review portfolio for Amit Singh',
    description: 'Quarterly portfolio review and rebalancing',
    dueDate: '2023-11-18',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Rahul Verma',
    relatedTo: 'Amit Singh',
    relatedToType: 'Client',
  },
  {
    id: 4,
    title: 'Prepare presentation for Neha Gupta',
    description: 'Create investment strategy presentation for upcoming meeting',
    dueDate: '2023-11-20',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Amit Kumar',
    relatedTo: 'Neha Gupta',
    relatedToType: 'Client',
  },
  {
    id: 5,
    title: 'Follow up with Vikram Mehta lead',
    description: 'Call to discuss mutual fund options',
    dueDate: '2023-11-14',
    priority: 'Low',
    status: 'Completed',
    assignedTo: 'Neha Singh',
    relatedTo: 'Vikram Mehta',
    relatedToType: 'Lead',
  },
  {
    id: 6,
    title: 'Update KYC for Anjali Desai',
    description: 'Collect updated KYC documents',
    dueDate: '2023-11-25',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Rahul Verma',
    relatedTo: 'Anjali Desai',
    relatedToType: 'Client',
  },
  {
    id: 7,
    title: 'Schedule meeting with Rahul Joshi',
    description: 'Discuss new tax-saving investment options',
    dueDate: '2023-11-22',
    priority: 'Low',
    status: 'Pending',
    assignedTo: 'Amit Kumar',
    relatedTo: 'Rahul Joshi',
    relatedToType: 'Client',
  },
];

const TaskManagement = ({ userRole }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: '',
    relatedTo: '',
    relatedToType: 'Client',
  });

  const handleOpenDialog = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo,
        relatedTo: task.relatedTo,
        relatedToType: task.relatedToType,
      });
    } else {
      setCurrentTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: '',
        relatedTo: '',
        relatedToType: 'Client',
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
    if (currentTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? { ...task, ...formData } : task
      ));
    } else {
      // Add new task
      const newTask = {
        id: tasks.length + 1,
        ...formData,
      };
      setTasks([...tasks, newTask]);
    }
    handleCloseDialog();
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleCompleteTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: 'Completed' } : task
    ));
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
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
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'Pending';
    if (filter === 'completed') return task.status === 'Completed';
    if (filter === 'high') return task.priority === 'High';
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate === today;
    }
    return true;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Task
        </Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter Tasks</InputLabel>
              <Select
                value={filter}
                onChange={handleFilterChange}
                label="Filter Tasks"
              >
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="pending">Pending Tasks</MenuItem>
                <MenuItem value="completed">Completed Tasks</MenuItem>
                <MenuItem value="high">High Priority</MenuItem>
                <MenuItem value="today">Due Today</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`Total: ${tasks.length}`} 
                color="primary" 
              />
              <Chip 
                icon={<FlagIcon />} 
                label={`High Priority: ${tasks.filter(t => t.priority === 'High').length}`} 
                color="error" 
              />
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`Completed: ${tasks.filter(t => t.status === 'Completed').length}`} 
                color="success" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card 
              variant="outlined" 
              sx={{
                bgcolor: task.status === 'Completed' ? '#f5f5f5' : 'white',
                position: 'relative',
                '&::before': task.priority === 'High' ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'error.main',
                } : {},
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ 
                    textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                    color: task.status === 'Completed' ? 'text.secondary' : 'text.primary',
                  }}>
                    {task.title}
                  </Typography>
                  <Chip 
                    label={task.priority} 
                    color={getPriorityColor(task.priority)} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {task.dueDate}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {task.assignedTo}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {task.relatedToType}: {task.relatedTo}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                {task.status !== 'Completed' && (
                  <Button 
                    size="small" 
                    startIcon={<CheckCircleIcon />} 
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    Complete
                  </Button>
                )}
                <Button 
                  size="small" 
                  startIcon={<EditIcon />} 
                  onClick={() => handleOpenDialog(task)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {currentTask 
              ? 'Update the task information below.'
              : 'Fill in the details to add a new task to the system.'}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Task Title"
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
                name="dueDate"
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
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
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
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
              <FormControl fullWidth margin="dense">
                <InputLabel>Related To Type</InputLabel>
                <Select
                  name="relatedToType"
                  value={formData.relatedToType}
                  onChange={handleInputChange}
                  label="Related To Type"
                >
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Lead">Lead</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="relatedTo"
                label="Related To"
                value={formData.relatedTo}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                placeholder="Client/Lead Name"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<AssignmentIcon />}>
            {currentTask ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement;