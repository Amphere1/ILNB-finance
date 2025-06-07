import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function HrSidebarSection({ user }) {
  const [isOpen, setIsOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const canApprove = ["rm_head", "business_head", "top_management"].includes(user?.role);
  const canAdd = canApprove;
  const canApply = ["rm", "rm_head", "business_head"].includes(user?.role);

  useEffect(() => {
    const fetchPending = async () => {
      if (!canApprove) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/leave/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingCount(res.data.length);
      } catch (err) {
        setPendingCount(0);
      }
    };
    fetchPending();
  }, [user?.role]);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-2 bg-gray-200 hover:bg-gray-300 font-medium"
      >
        HR {isOpen ? "▾" : "▸"}
      </button>

      {isOpen && (
        <ul className="space-y-1 mt-1 text-sm pl-4">
            {canApprove && (
          <li>
            <button
              onClick={() => navigate("/dashboard/all-leaves")}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                location.pathname === "/dashboard/all-leaves" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              Leave Request
            </button>
          </li>
            )}
          <li>
            <button
              onClick={() => navigate("/dashboard/leave-history")}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                location.pathname === "/dashboard/leave-history" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              My Leave History
            </button>
          </li>
            {canApply && (
                <li>
            <button
              onClick={() => navigate("/dashboard/apply-leave")}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                location.pathname === "/dashboard/apply-leave" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              Apply Leave
            </button>
          </li>
            )}

          {canApprove && (
            <li>
              <button
                onClick={() => navigate("/dashboard/approvals")}
                className={`relative block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                  location.pathname === "/dashboard/approvals" ? "bg-blue-100 text-blue-800" : ""
                }`}
              >
                Manager Approvals
                {pendingCount > 0 && (
                  <span className="absolute right-4 top-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => navigate("/dashboard/employees")}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                location.pathname === "/dashboard/employees" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              Employee Directory
            </button>
          </li>

          {canAdd && (
            <li>
              <button
                onClick={() => navigate("/dashboard/add-subordinate")}
                className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                  location.pathname === "/dashboard/add-subordinate" ? "bg-blue-100 text-blue-800" : ""
                }`}
              >
                Add Subordinate
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => navigate("/dashboard/change-password")}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                location.pathname === "/dashboard/change-password" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              Change Password
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
