import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddEmployeeForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    department: "",
    crmRole: "",
    dateOfJoining: "",
    role: "employee",
    managerId: ""
  });

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    // fetch users with manager roles
    axios.get("/api/users?role=rm").then(res => setManagers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/users/register", form);
    alert("Employee added!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-xl">
      <h2 className="text-xl font-bold">Add New Employee</h2>

      <input className="border p-2 w-full" placeholder="Name" required
        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      
      <input className="border p-2 w-full" placeholder="Designation"
        value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />

      <input className="border p-2 w-full" placeholder="Department"
        value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />

      <input className="border p-2 w-full" placeholder="CRM Role"
        value={form.crmRole} onChange={e => setForm({ ...form, crmRole: e.target.value })} />

      <input className="border p-2 w-full" type="date"
        value={form.dateOfJoining} onChange={e => setForm({ ...form, dateOfJoining: e.target.value })} />

      <select className="border p-2 w-full"
        value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="employee">Employee</option>
        <option value="rm">RM</option>
        <option value="rm_head">RM Head</option>
        <option value="business_head">Business Head</option>
        <option value="admin">Admin</option>
      </select>

      <select className="border p-2 w-full"
        value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
        <option value="">Select Reporting Manager</option>
        {managers.map((mgr) => (
          <option key={mgr._id} value={mgr._id}>
            {mgr.name} ({mgr.email})
          </option>
        ))}
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Add Employee
      </button>
    </form>
  );
}
