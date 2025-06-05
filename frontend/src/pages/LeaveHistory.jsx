import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyLeaveHistory() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    axios.get("/api/leave/my-requests").then(res => setLeaves(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">My Leave Requests</h2>
      <ul className="space-y-2">
        {leaves.map((leave) => (
          <li key={leave._id} className="border p-2 rounded">
            <strong>{leave.leaveType}</strong> — {leave.startDate} to {leave.endDate}
            <br />
            Status: <span className={
              leave.status === "Approved" ? "text-green-600" :
              leave.status === "Rejected" ? "text-red-600" : "text-yellow-600"
            }>{leave.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
