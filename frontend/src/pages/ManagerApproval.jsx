import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManagerLeaveApprovals() {
  const [pending, setPending] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    axios.get("/api/leave/pending").then(res => setPending(res.data));
    axios.get("/api/leave/all").then(res => setAllRequests(res.data));
  }, []);

  const handleAction = async (id, status) => {
    await axios.post(`/api/leave/${id}/status`, { status });
    setPending(pending.filter(l => l._id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pending Leave Approvals</h2>
      <ul className="space-y-2 mb-6">
        {pending.map((leave) => (
          <li key={leave._id} className="border p-2 rounded">
            <p>
              <strong>{leave.employeeId.name}</strong> requested <b>{leave.leaveType}</b> from <b>{leave.startDate}</b> to <b>{leave.endDate}</b>
            </p>
            <button
              className="bg-green-600 text-white px-3 py-1 mr-2 rounded"
              onClick={() => handleAction(leave._id, "Approved")}
            >
              Approve
            </button>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => handleAction(leave._id, "Rejected")}
            >
              Reject
            </button>
          </li>
        ))}
      </ul>

      
    </div>
  );
}
