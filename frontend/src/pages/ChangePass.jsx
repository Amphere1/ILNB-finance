import React, { useState } from "react";
import hrService from "../services/hrService";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setForm({ ...form, newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate passwords
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password should be at least 8 characters long");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    try {
      setLoading(true);      await hrService.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });

      setSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength(0);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to change password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Password changed successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            placeholder="Enter your current password"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            placeholder="Enter your new password"
            value={form.newPassword}
            onChange={handlePasswordChange}
            required
            disabled={loading}
          />
          
          {form.newPassword && (
            <>
              <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor()}`} 
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                Password strength: {
                  passwordStrength === 0 ? "None" :
                  passwordStrength <= 2 ? "Weak" :
                  passwordStrength <= 3 ? "Medium" : "Strong"
                }
              </p>
              <ul className="text-xs mt-1 text-gray-600 list-disc pl-4">
                <li className={form.newPassword.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                <li className={form.newPassword.match(/[a-z]/) ? "text-green-600" : ""}>Lowercase letters</li>
                <li className={form.newPassword.match(/[A-Z]/) ? "text-green-600" : ""}>Uppercase letters</li>
                <li className={form.newPassword.match(/[0-9]/) ? "text-green-600" : ""}>Numbers</li>
                <li className={form.newPassword.match(/[^a-zA-Z0-9]/) ? "text-green-600" : ""}>Special characters</li>
              </ul>
            </>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            placeholder="Confirm your new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />
          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
          )}
        </div>

        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 w-full" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
