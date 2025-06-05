// routes/employee.routes.js
import express from "express";
import User from "../models/userModel.js";

const router = express.Router();

// GET /api/employees?name=raj&department=sales
router.get("/", async (req, res) => {
  const { name, department } = req.query;
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" }; // case-insensitive partial match
  }
  if (department) {
    query.department = department;
  }

  try {
    const employees = await User.find(query)
      .select("name email designation department crmRole dateOfJoining managerId")
      .populate("managerId", "name");

    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
