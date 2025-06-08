import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  leaveType: {
    type: String,
    enum: ["Casual", "Sick", "Earned", "Maternity", "Paternity", "Comp-Off", "Special"]
  },
  startDate: Date,
  endDate: Date,
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  appliedOn: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  currentApprover: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("LeaveRequest", LeaveRequestSchema);
