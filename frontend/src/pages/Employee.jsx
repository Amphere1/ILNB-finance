import React, { useState, useEffect } from "react";
import hrService from "../services/hrService";
import { 
  CircularProgress, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Button,
  FormHelperText,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  RestartAlt as RestartIcon,
  FilterAlt as FilterIcon  
} from '@mui/icons-material';

export default function EmployeeDirectory() {
  const [filters, setFilters] = useState({
    username: "",
    department: "",
    location: "",
    role: ""
  });
  const [departments, setDepartments] = useState(["IT", "HR", "Sales", "Marketing", "Finance"]);
  const [locations, setLocations] = useState(["New York", "Mumbai", "London", "Singapore", "Tokyo"]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployees(filters);
      setEmployees(data);
      setError(null);
      
      // Extract unique departments and locations for filters
      const uniqueDepartments = [...new Set(data.filter(emp => emp.department).map(emp => emp.department))];
      const uniqueLocations = [...new Set(data.filter(emp => emp.location).map(emp => emp.location))];
      
      if (uniqueDepartments.length > 0) {
        setDepartments(uniqueDepartments);
      }
      if (uniqueLocations.length > 0) {
        setLocations(uniqueLocations);
      }
      
      setSnackbar({
        open: true,
        message: `Found ${data.length} ${data.length === 1 ? 'employee' : 'employees'}`,
        severity: 'success'
      });
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch employees',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };
  
  const handleReset = () => {
    setFilters({
      username: "",
      department: "",
      location: "",
      role: ""
    });
    fetchEmployees();
  };
    // Removed unused function
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Directory</h2>

      <form onSubmit={handleSearch} className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            size="small"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            placeholder="Search by name..."
          />
          
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              label="Location"
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="rm">Relationship Manager</MenuItem>
              <MenuItem value="rm_head">RM Head</MenuItem>
              <MenuItem value="business_head">Business Head</MenuItem>
              <MenuItem value="top_management">Top Management</MenuItem>
            </Select>
          </FormControl>
        </div>
        
        <div className="flex justify-end mt-4 gap-2">
          <Button 
            variant="outlined" 
            startIcon={<RestartIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            type="submit" 
            color="primary"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </div>
        
        {Object.values(filters).some(val => val) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Active Filters:</span>
            {filters.username && (
              <Chip 
                label={`Name: ${filters.username}`} 
                size="small"
                onDelete={() => setFilters({ ...filters, username: "" })}
              />
            )}
            {filters.location && (
              <Chip 
                label={`Location: ${filters.location}`} 
                size="small"
                onDelete={() => setFilters({ ...filters, location: "" })}
              />
            )}
            {filters.department && (
              <Chip 
                label={`Department: ${filters.department}`} 
                size="small"
                onDelete={() => setFilters({ ...filters, department: "" })}
              />
            )}
            {filters.role && (
              <Chip 
                label={`Role: ${filters.role}`} 
                size="small"
                onDelete={() => setFilters({ ...filters, role: "" })}
              />
            )}
          </div>
        )}
      </form>
      
      <div className="bg-white border rounded-lg p-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No employees found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Designation</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Date of Joining</th>
                  <th className="border p-2">Reporting Manager</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium">{emp.username}</td>
                    <td className="border p-2">{emp.email}</td>
                    <td className="border p-2">{emp.designation || "—"}</td>
                    <td className="border p-2">{emp.department || "—"}</td>
                    <td className="border p-2">{emp.location || "—"}</td>
                    <td className="border p-2">
                      <Chip
                        label={emp.role}
                        size="small"
                        color={
                          emp.role === "top_management" ? "error" :
                          emp.role === "business_head" ? "warning" :
                          emp.role === "rm_head" ? "info" : "success"
                        }
                        variant="outlined"
                      />
                    </td>
                    <td className="border p-2">
                      {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : "—"}
                    </td>
                    <td className="border p-2">{emp.managerId?.username || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right text-sm text-gray-600">
              Total: {employees.length} employees
            </div>
          </div>
        )}
      </div>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
