import express from "express";
import LeaveRequest from "../models/leaveModel.js";
const router = express.Router();


router.post("/apply", async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    const leave = new LeaveRequest({ ...req.body, 
        employeeId: req.user._id,
        currentApprover: employee.managerId});
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /my-requests – Employee sees own leave requests
router.get("/my-requests", async (req, res) => {
  const leaves = await LeaveRequest.find({ employeeId: req.user._id });
  res.json(leaves);
});

// GET /all – Admin gets all leave requests
router.get("/all", async (req, res) => {
  try {
    const subordinates = await User.find({ managerId: req.user._id }).select("_id");
    const subordinateIds = subordinates.map(user => user._id);

    const leaves = await LeaveRequest.find({
      employeeId: { $in: subordinateIds }
    }).populate("employeeId", "name email");

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", async (req, res) => {
  const leaves = await LeaveRequest.find({
    currentApprover: req.user._id,
    status: "Pending"
  }).populate("employeeId", "name email");
  res.json(leaves);
});


// POST /:id/status – Admin approves/rejects
router.post("/:id/status", async (req, res) => {
  const { status } = req.body;
  const leave = await LeaveRequest.findById(req.params.id);

  if (!leave || leave.status !== "Pending") {
    return res.status(400).json({ error: "Invalid or already processed" });
  }

  leave.status = status; 
  leave.approvedBy = req.user._id;
  leave.currentApprover = null;
  await leave.save();

  res.json({ message: `Leave ${status.toLowerCase()} successfully` });
});

export default router;
