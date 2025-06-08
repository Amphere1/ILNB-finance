import React, { useState } from "react";
import hrService from "../services/hrService";

export default function ApplyLeaveForm() {
  const [form, setForm] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required");
      return;
    }
    
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (endDate < startDate) {
      setError("End date cannot be before start date");
      return;
    }
    
    // Validate reason for certain leave types
    if ((form.leaveType === "Special" || form.leaveType === "Earned") && !form.reason) {
      setError(`A reason is required for ${form.leaveType} leave`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      console.log('Submitting leave application:', form);
      
      const result = await hrService.applyLeave(form);
      console.log('Leave application result:', result);
      
      setSuccess(true);
      setForm({
        leaveType: "Casual",
        startDate: "",
        endDate: "",
        reason: ""
      });
    } catch (err) {
      console.error('Leave application error:', err);
      const errorMessage = 
        typeof err === 'object' && err.error ? err.error : 
        err.message || "Failed to apply for leave";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Leave application submitted successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
            <select
              className="border p-2 rounded w-full"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              required
              disabled={loading}
            >
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Earned">Earned Leave</option>
              <option value="Special">Special Leave</option>
            </select>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              placeholder="Please provide a reason for your leave request"
              className="border p-2 rounded w-full h-24"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Apply for Leave"}
          </button>
        </div>
      </form>
    </div>
  );
}
