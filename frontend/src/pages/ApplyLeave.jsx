import React, { useState } from "react";
import axios from "axios";

export default function ApplyLeaveForm() {
  const [form, setForm] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/leave/apply", form);
      alert("Leave applied successfully");
    } catch (err) {
      alert("Failed to apply: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        className="border p-2"
        value={form.leaveType}
        onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
      >
        <option>Casual</option>
        <option>Sick</option>
        <option>Earned</option>
        <option>Special</option>
      </select>

      <input
        type="date"
        className="border p-2"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />
      <input
        type="date"
        className="border p-2"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />

      <textarea
        placeholder="Reason"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, reason: e.target.value })}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Apply Leave
      </button>
    </form>
  );
}
