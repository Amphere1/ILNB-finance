import React, { useState } from "react";
import axios from "axios";

export default function CreateSubordinateForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    designation: "",
    department: "",
    location: "",
    role: "rm",
    dateOfJoining: ""
  });
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = currentUser?.role;

  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/users/create-subordinate", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponse(res.data);
      alert("User created. Password: " + res.data.generatedPassword);
      setForm({ ...form, name: "", email: "" }); // reset basic fields
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 border rounded">
      <h2 className="text-xl font-bold">Add Subordinate</h2>

      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        className="border p-2 w-full"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <input
        className="border p-2 w-full"
        placeholder="Designation"
        value={form.designation}
        onChange={(e) => setForm({ ...form, designation: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        placeholder="Department"
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        type="date"
        value={form.dateOfJoining}
        onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
      />

            <select
        className="border p-2 w-full"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        required
        >
        {currentUserRole === "top_management" && (
            <>
            <option value="top_management">Top Management</option>
            <option value="business_head">Business Head</option>
            </>
        )}

        {currentUserRole === "business_head" && (
            <option value="rm_head">RM Head</option>
        )}

        {currentUserRole === "rm_head" && (
            <option value="rm">Relationship Manager</option>
        )}
        </select>


      <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
        Create User
      </button>

      {response && (
        <div className="mt-4 p-3 border rounded bg-green-50">
          <p><strong>Email:</strong> {response.email}</p>
          <p><strong>Generated Password:</strong> {response.generatedPassword}</p>
          <p className="text-sm text-gray-600">The user should change it after first login.</p>
        </div>
      )}
    </form>
  );
}
