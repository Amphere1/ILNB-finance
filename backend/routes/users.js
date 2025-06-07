import express from "express";
import User from "../models/userModel.js";
import RoleRequest from "../models/roleRequestModel.js";
import verifyToken from "../middleware/auth.js";
import authorize from "../middleware/roleAuth.js";

const router = express.Router();

// Get all users - only accessible by top management
router.get(
  "/",
  verifyToken,
  authorize(["top_management"]),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update user role - only accessible by top management
router.put(
  "/:userId/role",
  verifyToken,
  authorize(["top_management"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      const { userId } = req.params;

      // Validate role
      const validRoles = ["top_management", "business_head", "rm_head", "rm"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Submit a role upgrade request
router.post(
  "/role-request",
  verifyToken,
  async (req, res) => {
    try {
      const { requestedRole, justification } = req.body;
      const userId = req.user._id;

      // Validate role
      const validRoles = ["top_management", "business_head", "rm_head", "rm"];
      if (!validRoles.includes(requestedRole)) {
        return res.status(400).json({ message: "Invalid role requested" });
      }

      // Get user's current role
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if requested role is higher than current role
      const roleHierarchy = {
        rm: 0,
        rm_head: 1,
        business_head: 2,
        top_management: 3
      };

      if (roleHierarchy[requestedRole] <= roleHierarchy[user.role]) {
        return res.status(400).json({ 
          message: "Cannot request a role that is equal to or lower than your current role" 
        });
      }

      // Check if there's already a pending request
      const existingRequest = await RoleRequest.findOne({
        user: userId,
        status: "pending"
      });

      if (existingRequest) {
        return res.status(400).json({ 
          message: "You already have a pending role upgrade request" 
        });
      }

      // Create new request
      const roleRequest = new RoleRequest({
        user: userId,
        currentRole: user.role,
        requestedRole,
        justification,
        status: "pending"
      });

      await roleRequest.save();
      res.status(201).json({ message: "Role upgrade request submitted successfully" });
    } catch (error) {
      console.error("Error submitting role request:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all role requests - only accessible by top management
router.get(
  "/role-requests",
  verifyToken,
  authorize(["top_management"]),
  async (req, res) => {
    try {
      const roleRequests = await RoleRequest.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 });
      res.status(200).json(roleRequests);
    } catch (error) {
      console.error("Error fetching role requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Process a role request (approve/reject) - only accessible by top management
router.put(
  "/role-requests/:requestId",
  verifyToken,
  authorize(["top_management"]),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, comment } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const roleRequest = await RoleRequest.findById(requestId);
      if (!roleRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      roleRequest.status = status;
      roleRequest.adminComment = comment || "";
      roleRequest.processedAt = Date.now();
      roleRequest.processedBy = req.user._id;

      await roleRequest.save();

      // If approved, update the user's role
      if (status === "approved") {
        await User.findByIdAndUpdate(
          roleRequest.user,
          { role: roleRequest.requestedRole }
        );
      }

      res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
      console.error("Error processing role request:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get current user's role requests
router.get(
  "/my-role-requests",
  verifyToken,
  async (req, res) => {
    try {
      const roleRequests = await RoleRequest.find({ user: req.user._id })
        .sort({ createdAt: -1 });
      res.status(200).json(roleRequests);
    } catch (error) {
      console.error("Error fetching user's role requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;