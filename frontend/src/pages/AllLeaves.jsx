import React, { useEffect, useState, useContext } from "react";
import hrService from "../services/hrService";
import { AuthContext } from "../contexts/AuthContext";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    dateRange: 'all'
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const data = await hrService.getAllLeaveRequests();
        setLeaves(data);
        setFilteredLeaves(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching all leaves:', err);
        setError('Failed to fetch leave records');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user._id) {
      fetchLeaves();
    }
  }, [user]);
  
  // Apply filters when filter state changes
  useEffect(() => {
    if (leaves.length === 0) return;
    
    let result = [...leaves];
    
    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(leave => leave.status === filters.status);
    }
    
    // Filter by department
    if (filters.department !== 'all') {
      result = result.filter(leave => leave.employeeId?.department === filters.department);
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const pastDate = new Date();
      
      switch(filters.dateRange) {
        case 'thisWeek':
          pastDate.setDate(now.getDate() - 7);
          break;
        case 'thisMonth':
          pastDate.setDate(now.getDate() - 30);
          break;
        case 'thisYear':
          pastDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(leave => new Date(leave.appliedOn) >= pastDate);
    }
    
    setFilteredLeaves(result);
  }, [filters, leaves]);
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Get unique departments for filtering
  const departments = ['all', ...new Set(leaves.map(leave => leave.employeeId?.department).filter(Boolean))];  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Leave Requests</h2>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <p>Loading leave records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded text-center">
          <p className="text-gray-600">No leave records found.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="statusFilter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                id="departmentFilter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.filter(d => d !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                id="dateRangeFilter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
          </div>
          
          {/* Leave Records Table */}
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{leave.employeeId?.username || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{leave.employeeId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{leave.employeeId?.department || "N/A"}</div>
                      <div className="text-sm text-gray-500">{leave.employeeId?.designation || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.appliedOn).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === "Approved" ? "bg-green-100 text-green-800" :
                        leave.status === "Rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
