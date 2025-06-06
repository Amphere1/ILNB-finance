import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmployeeDirectory() {
  const [filters, setFilters] = useState({
    name: "",
    department: "",
    location: "",
    role: ""
  });

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`/api/employees?${query}`);
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleReset = () => {
    setFilters({ name: "", department: "", location: "", role: "" });
    fetchEmployees();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Directory</h2>

      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          className="border p-2 rounded"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="rm">Relationship Manager</option>
          <option value="rm_head">RM Head</option>
          <option value="business_head">Business Head</option>
          <option value="top_management">Top Management</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
        <button type="button" onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 rounded">
          Reset
        </button>
      </form>

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
            <tr key={emp._id}>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">{emp.designation}</td>
              <td className="border p-2">{emp.department}</td>
              <td className="border p-2">{emp.location}</td>
              <td className="border p-2">{emp.role}</td>
              <td className="border p-2">{emp.dateOfJoining?.slice(0, 10)}</td>
              <td className="border p-2">{emp.managerId?.name || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
