import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentRole: {
      type: String,
      enum: ["top_management", "business_head", "rm_head", "rm"],
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ["top_management", "business_head", "rm_head", "rm"],
      required: true,
    },
    justification: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const RoleRequest = mongoose.model("RoleRequest", roleRequestSchema);

export default RoleRequest;