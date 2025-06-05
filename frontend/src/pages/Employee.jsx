import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState({ name: "", department: "" });

  const fetchData = async () => {
    const query = new URLSearchParams(search).toString();
    const res = await axios.get(`/api/employees?${query}`);
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Employee Directory</h2>

      <form onSubmit={handleSearch} className="mb-4 space-x-2">
        <input
          className="border p-1"
          placeholder="Search by name"
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input
          className="border p-1"
          placeholder="Department"
          value={search.department}
          onChange={(e) => setSearch({ ...search, department: e.target.value })}
        />
        <button className="bg-blue-500 text-white px-3 py-1 rounded">Search</button>
      </form>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Department</th>
            <th>CRM Role</th>
            <th>Date of Joining</th>
            <th>Reporting Manager</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.designation}</td>
              <td>{emp.department}</td>
              <td>{emp.crmRole}</td>
              <td>{emp.dateOfJoining?.slice(0, 10)}</td>
              <td>{emp.managerId?.name || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
