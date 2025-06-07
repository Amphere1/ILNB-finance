import React, { useState } from "react";
import axios from "axios";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return alert("New passwords do not match");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "/api/auth/change-password",
        {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(res.data.message);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-md">
      <h2 className="text-xl font-bold">Change Password</h2>

      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Current Password"
        value={form.oldPassword}
        onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        required
      />
      <input
        type="password"
        className="border p-2 w-full"
        placeholder="New Password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        required
      />
      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Confirm New Password"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        required
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Update Password
      </button>
    </form>
  );
}
