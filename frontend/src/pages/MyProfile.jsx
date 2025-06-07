import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      <div className="bg-white shadow-md rounded p-4 space-y-4">
        <div>
          <p className="font-semibold">Name:</p>
          <p>{profile.username}</p>
        </div>
        <div>
          <p className="font-semibold">Email:</p>
          <p>{profile.email}</p>
        </div>
        <div>
          <p className="font-semibold">Role:</p>
          <p className="capitalize">{profile.role.replace("_", " ")}</p>
        </div>
        {profile.designation && (
          <div>
            <p className="font-semibold">Designation:</p>
            <p>{profile.designation}</p>
          </div>
        )}
        {profile.department && (
          <div>
            <p className="font-semibold">Department:</p>
            <p>{profile.department}</p>
          </div>
        )}
        {profile.location && (
          <div>
            <p className="font-semibold">Location:</p>
            <p>{profile.location}</p>
          </div>
        )}
        {profile.dateOfJoining && (
          <div>
            <p className="font-semibold">Date of Joining:</p>
            <p>{profile.dateOfJoining.slice(0, 10)}</p>
          </div>
        )}
        {profile.managerId?.name && (
          <div>
            <p className="font-semibold">Reporting Manager:</p>
            <p>{profile.managerId.name} ({profile.managerId.email})</p>
          </div>
        )}
      </div>
    </div>
  );
}
