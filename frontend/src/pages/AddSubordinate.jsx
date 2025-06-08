import React, { useState, useEffect } from "react";
import hrService from "../services/hrService";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-300 rounded">
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="mb-4">There was an error loading this component.</p>
          <details className="bg-white p-2 rounded">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// The main subordinate creation form component
function CreateSubordinateForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    designation: "",
    department: "",
    location: "",
    role: "rm",
    dateOfJoining: ""
  });
  
  // Initialize date with today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10); // Format as YYYY-MM-DD
    setForm(prev => ({
      ...prev,
      dateOfJoining: formattedDate
    }));
  }, []);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = currentUser?.role;

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);  const validateForm = () => {
    if (!form.username?.trim()) return "Username is required";
    if (!form.email?.trim()) return "Email is required";
    if (!form.designation?.trim()) return "Designation is required";
    if (!form.department?.trim()) return "Department is required";
    if (!form.dateOfJoining) return "Date of joining is required";
    if (!form.location?.trim()) return "Location is required";
    
    // Username validation
    if (form.username.trim().length < 3) return "Username must be at least 3 characters long";
    if (form.username.trim().length > 50) return "Username must not exceed 50 characters";
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address";
    
    // Date validation - make sure it's not a future date
    if (form.dateOfJoining) {
      const joinDate = new Date(form.dateOfJoining);
      const today = new Date();
      if (isNaN(joinDate.getTime())) return "Invalid date format";
      if (joinDate > today) return "Date of joining cannot be in the future";
    }
    
    // Role validation
    if (!form.role) return "Role is required";
    
    return null;
  };
  // Check if auth token is valid before submitting
  const checkAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage");
      return false;
    }
    
    try {
      // Simple check for token format (not a full validation)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error("Token has invalid format (not 3 parts)");
        return false;
      }
      
      // Check if token parts are valid base64 strings
      try {
        // Just try to decode the payload (middle part)
        const payload = JSON.parse(atob(parts[1]));
        
        // Check for token expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.error("Token has expired");
          return false;
        }
        
        console.log("Token validation passed");
        return true;
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        return false;
      }
    } catch (e) {
      console.error("Token check error:", e);
      return false;
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First check if the auth token is present and valid
    if (!checkAuthToken()) {
      setError("Authentication token is missing or invalid. Please log in again.");
      // Don't immediately redirect - allow user to see the error
      setTimeout(() => {
        if (confirm("You need to log in again. Redirect to login page?")) {
          window.location.href = "/login";
        }
      }, 2000);
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Format data properly for backend
      const formattedData = {
        ...form,
        username: form.username.trim(), // Remove extra whitespace
        email: form.email.trim().toLowerCase(), // Ensure lowercase email
        dateOfJoining: new Date(form.dateOfJoining).toISOString(),
        designation: form.designation.trim(),
        department: form.department.trim(),
        location: form.location.trim()
      };
      
      console.log("Submitting user data:", formattedData);
      
      // Verify the token one more time right before the API call
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token not found in localStorage");
      }
      
      // Add console logs for debugging
      console.log("Starting API call with token:", token.substring(0, 10) + "...");
      
      const res = await hrService.addSubordinate(formattedData);
      
      setResponse(res);
      setSuccess(true);
      setForm({
        ...form,
        username: "",
        email: "",
        designation: "",
        department: "",
        location: "",
        dateOfJoining: "",
        role: "rm" // Reset to default role
      });
    } catch (err) {
      console.error("Error creating subordinate:", err);
      
      // Handle authentication errors specifically
      if (err.response?.status === 401) {
        const errorDetails = err.response?.data?.details || '';
        setError(`Authentication failed (401): ${errorDetails}. Please log out and log back in.`);
        console.error("Authentication error details:", err.response?.data);
        
        // Add detailed debugging information
        console.log("Auth status check:", {
          tokenExists: !!localStorage.getItem('token'),
          userExists: !!localStorage.getItem('user')
        });
      }
      // Handle forbidden errors
      else if (err.response?.status === 403) {
        setError(`Permission denied (403): ${err.response?.data?.message || 'You do not have permission to perform this action.'}`);
      }
      // Handle validation errors from mongoose
      else if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).join(", ");
        setError(`Validation errors: ${validationErrors}`);
      } 
      // Handle other API errors
      else if (typeof err.response?.data === 'object' && err.response?.data !== null) {
        console.log("Detailed error response:", JSON.stringify(err.response.data, null, 2));
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create user";
        setError(errorMessage);
      } 
      // Handle network or other errors
      else {
        setError(`Request failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add Subordinate</h2>      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h4 className="font-bold mb-1">Error</h4>
          {typeof error === 'string' ? <p>{error}</p> : 
            error.errors ? (
              <ul className="list-disc pl-5">
                {Object.entries(error.errors).map(([field, msg]) => (
                  <li key={field}>{field}: {msg}</li>
                ))}
              </ul>
            ) : <p>{JSON.stringify(error)}</p>
          }
          
          {error.toString().includes("Authentication") && (
            <div className="mt-2 pt-2 border-t border-red-300">
              <p className="mb-2 font-medium">Authentication troubleshooting:</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    alert(token ? 
                      `Token exists: ${token.substring(0, 15)}...` : 
                      "No token found in localStorage");
                  }}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded"
                  type="button"
                >
                  Check Token
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const result = await hrService.testAuthentication();
                      alert(`Authentication test successful!\nUser: ${result.user.username}\nRole: ${result.user.role}`);
                    } catch (err) {
                      alert(`Authentication test failed: ${err.message || JSON.stringify(err)}`);
                      console.error("Auth test error:", err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  type="button"
                  disabled={loading}
                >
                  Test Auth
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = "/login";
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                  type="button"
                >
                  Log Out & Refresh
                </button>
              </div>
              <div className="text-xs text-gray-700 mt-1">
                <p>If authentication is failing, try:</p>
                <ol className="list-decimal pl-5">
                  <li>Testing authorization with the "Test Auth" button</li>
                  <li>Logging out and logging back in</li>
                  <li>Checking if your session has expired</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>User created successfully! Password: <strong>{response.generatedPassword}</strong></p>
          <p className="text-sm mt-1">Please share this password securely with the new employee.</p>
        </div>
      )}
        <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
        <div className="mb-3 text-sm text-gray-600">
          Fields marked with an asterisk (*) are required.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              className="border p-2 w-full rounded"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              disabled={loading}
              required
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
            <input
              className="border p-2 w-full rounded"
              type="date"
              value={form.dateOfJoining}
              onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
              disabled={loading}
              required
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              className="border p-2 w-full rounded"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              disabled={loading}
            >
              {currentUserRole === "top_management" && (
                <>
                  <option value="top_management">Top Management</option>
                  <option value="business_head">Business Head</option>
                  <option value="rm_head">RM Head</option>
                  <option value="rm">Relationship Manager</option>
                </>
              )}

              {currentUserRole === "business_head" && (
                <>
                  <option value="rm_head">RM Head</option>
                  <option value="rm">Relationship Manager</option>
                </>
              )}

              {currentUserRole === "rm_head" && (
                <option value="rm">Relationship Manager</option>
              )}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating User..." : "Create User"}
          </button>
        </div>

        {response && success && (
          <div className="mt-4 p-4 border rounded bg-green-50">
            <h3 className="font-semibold text-lg mb-2">User Created Successfully</h3>
            <p><strong>Email:</strong> {response.email}</p>
            <p><strong>Generated Password:</strong> {response.generatedPassword}</p>
            <p className="text-sm text-gray-600 mt-2">Please share this password securely with the new employee.</p>
          </div>        )}
      </form>
    </div>
  );
}

// Export the component wrapped in the error boundary
export default function SubordinateFormWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CreateSubordinateForm />
    </ErrorBoundary>
  );
}
