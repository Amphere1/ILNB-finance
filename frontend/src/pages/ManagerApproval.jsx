import React, { useEffect, useState, useContext } from "react";
import hrService from "../services/hrService";
import { AuthContext } from "../contexts/AuthContext";

export default function ManagerLeaveApprovals() {  const [pending, setPending] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [approvedByMe, setApprovedByMe] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [hierarchyInfo, setHierarchyInfo] = useState(null);
  const [loading, setLoading] = useState({
    pending: true,
    all: true,
    approvedByMe: true,
    hierarchy: true
  });
  const [error, setError] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        // Set loading states
        setLoading({
          pending: true,
          all: true,
          approvedByMe: true,
          hierarchy: true
        });
        
        // First, get the hierarchy information
        const hierarchyData = await hrService.getUserHierarchy();
        setHierarchyInfo(hierarchyData);
        
        console.log("User hierarchy information:", hierarchyData);
        
        // Fetch all three types of data
        const pendingData = await hrService.getPendingLeaveRequests();
        const allData = await hrService.getAllLeaveRequests();
        const approvedByMeData = await hrService.getApprovedByMeLeaveRequests();
        
        console.log("Pending leaves:", pendingData);
        
        // Update state with fetched data
        setPending(pendingData);
        setAllRequests(allData);
        setApprovedByMe(approvedByMeData);
        
        // Reset loading states
        setLoading({
          pending: false,
          all: false,
          approvedByMe: false
        });
      } catch (err) {
        setError('Failed to fetch leave data');
        console.error('Error fetching leave data:', err);
        setLoading({
          pending: false,
          all: false,
          approvedByMe: false
        });
      }
    };

    if (user && user._id) {
      fetchLeaveData();
    }
  }, [user]);
  const handleAction = async (id, status) => {
    try {
      await hrService.updateLeaveStatus(id, { status });
      setPending(pending.filter(l => l._id !== id));
      
      // Refresh all requests data
      const allData = await hrService.getAllLeaveRequests();
      const approvedByMeData = await hrService.getApprovedByMeLeaveRequests();
      
      setAllRequests(allData);
      setApprovedByMe(approvedByMeData);
    } catch (err) {
      setError('Failed to update leave status');
      console.error('Error updating leave status:', err);
    }
  };
  
  // Function to switch between tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };  return (
    <div className="container mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === 'pending' 
            ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`} 
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals
        </button>
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === 'all' 
            ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`} 
          onClick={() => setActiveTab('all')}
        >
          All Subordinate Leaves
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'processed' 
            ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`} 
          onClick={() => setActiveTab('processed')}
        >
          Processed by Me
        </button>
        <button 
          className="ml-auto bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Debug Information Section */}
      {showDebugInfo && hierarchyInfo && (
        <div className="bg-gray-50 p-4 rounded mb-6 border border-gray-300">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          
          <div className="mb-4">
            <h4 className="font-medium">Current User</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(hierarchyInfo.currentUser, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium">Direct Subordinates ({hierarchyInfo.subordinateCount})</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(hierarchyInfo.directSubordinates, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium">Pending Leaves ({pending.length})</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(pending.map(leave => ({
                _id: leave._id,
                employee: leave.employeeId?.username,
                employeeId: leave.employeeId?._id,
                approver: leave.currentApprover?.username,
                approverId: leave.currentApprover?._id,
                status: leave.status
              })), null, 2)}
            </pre>
          </div>
          
          {user && user.role === 'top_management' && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={async () => {
                    try {
                      setError(null);
                      const result = await hrService.fixLeaveApprovers();
                      alert(`Fixed ${result.fixedCount} leave requests. ${result.noManagerCount} employees have no manager assigned.`);
                      
                      // Refresh data
                      const pendingData = await hrService.getPendingLeaveRequests();
                      setPending(pendingData);
                    } catch (err) {
                      setError('Failed to fix leave approvers: ' + (err.message || 'Unknown error'));
                      console.error('Error fixing leave approvers:', err);
                    }
                  }}
                >
                  Fix Leave Approvers
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Fix leave requests with missing approvers
                </p>
              </div>
              
              <div>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={async () => {
                    try {
                      setError(null);
                      if (!confirm("This will assign managers to users without managers and fix leave approvers. Continue?")) {
                        return;
                      }
                      
                      const result = await hrService.bulkFixApprovers();
                      alert(`Fixed ${result.usersFixed} users and ${result.leavesFixed} leave requests. ${result.errors} errors.`);
                      
                      // Refresh all data
                      const hierarchyData = await hrService.getUserHierarchy();
                      const pendingData = await hrService.getPendingLeaveRequests();
                      const allData = await hrService.getAllLeaveRequests();
                      
                      setHierarchyInfo(hierarchyData);
                      setPending(pendingData);
                      setAllRequests(allData);
                    } catch (err) {
                      setError('Failed to run bulk fix: ' + (err.message || 'Unknown error'));
                      console.error('Error running bulk fix:', err);
                    }
                  }}
                >
                  Bulk Fix Everything
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-assign managers and fix all approvals
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Pending Leave Approvals</h2>
          
          {loading.pending ? (
            <div className="flex justify-center p-4">
              <p className="text-gray-600">Loading pending approvals...</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-600">No pending leave requests to approve.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {pending.map((leave) => (
                <div key={leave._id} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{leave.employeeId?.username || "Employee"}</h3>
                      <p className="text-sm text-gray-500">{leave.employeeId?.department} • {leave.employeeId?.designation}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                      Pending
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Leave Type</p>
                      <p className="font-medium">{leave.leaveType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-sm">{leave.reason}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-200"
                      onClick={() => handleAction(leave._id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-200"
                      onClick={() => handleAction(leave._id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* All Subordinate Leaves Tab */}
      {activeTab === 'all' && (
        <div>
          <h2 className="text-xl font-bold mb-4">All Subordinate Leave Requests</h2>
          
          {loading.all ? (
            <div className="flex justify-center p-4">
              <p className="text-gray-600">Loading all leave requests...</p>
            </div>
          ) : allRequests.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-600">No leave requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRequests.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeId?.username || "Employee"}</div>
                        <div className="text-sm text-gray-500">{leave.employeeId?.designation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.employeeId?.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString()}</td>
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
          )}
        </div>
      )}
      
      {/* Processed by Me Tab */}
      {activeTab === 'processed' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Leave Requests Processed by Me</h2>
          
          {loading.approvedByMe ? (
            <div className="flex justify-center p-4">
              <p className="text-gray-600">Loading processed leave requests...</p>
            </div>
          ) : approvedByMe.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-600">You haven't processed any leave requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Processed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedByMe.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeId?.username || "Employee"}</div>
                        <div className="text-sm text-gray-500">{leave.employeeId?.designation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.employeeId?.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.status === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.updatedAt || leave.appliedOn).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
