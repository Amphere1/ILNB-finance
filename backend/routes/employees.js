import express from "express";
import User from "../models/userModel.js";

const router = express.Router();


router.get("/", async (req, res) => {
  const { name, department, location, role } = req.query;
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" }; // partial case-insensitive
  }
  if (department) {
    query.department = department;
  }
  if (location) {
    query.location = { $regex: location, $options: "i" }; // flexible match
  }
  if (role) {
    query.role = role;
  }

  try {
    const employees = await User.find(query)
      .select("name email designation department location crmRole dateOfJoining role managerId")
      .populate("managerId", "name email");

    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
