import React, { useEffect, useState } from "react";
import hrService from "../services/hrService";
import { useAuth } from "../contexts/AuthContext";

export default function MyLeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyLeaves = async () => {
      if (!user) return;
      try {
        setLoading(true);
        console.log('Fetching leave requests for user:', user);
        const data = await hrService.getMyLeaveRequests();
        console.log('Received leave data:', data);
        setLeaves(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my leave requests:', err);
        setError('Failed to fetch leave records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyLeaves();
  }, [user]);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Leave Requests</h2>
      
      {loading ? (
        <p>Loading leave requests...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : leaves.length === 0 ? (
        <p className="text-gray-600">No leave requests found.</p>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave._id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{leave.leaveType}</h3>
                  <p className="text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  {leave.reason && (
                    <p className="mt-2 text-sm text-gray-700">
                      <strong>Reason:</strong> {leave.reason}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  leave.status === "Approved" ? "bg-green-100 text-green-800" :
                  leave.status === "Rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {leave.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
