import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/leave/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(res.data);
    };
    fetchLeaves();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Leave History</h2>

      {leaves.length === 0 ? (
        <p>No leave records found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Employee</th>
              <th className="border p-2">Leave Type</th>
              <th className="border p-2">From</th>
              <th className="border p-2">To</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id} className="border-b">
                <td className="border p-2">
                  {leave.employeeId?.name} ({leave.employeeId?.email})
                </td>
                <td className="border p-2">{leave.leaveType}</td>
                <td className="border p-2">{leave.startDate.slice(0, 10)}</td>
                <td className="border p-2">{leave.endDate.slice(0, 10)}</td>
                <td className="border p-2">{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
