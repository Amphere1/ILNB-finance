import express from "express";
import LeaveRequest from "../models/leaveModel.js";
import User from "../models/userModel.js";
import verifyToken from "../middleware/auth.js";
const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);


router.post("/apply", async (req, res) => {
  try {
    const employee = await User.findById(req.user._id)
      .populate('managerId', 'username email role'); // Populate manager details
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    // Get direct manager for the employee
    let manager = employee.managerId;
    
    console.log('Employee applying for leave:', {
      employeeId: employee._id,
      username: employee.username,
      role: employee.role,
      managerId: manager ? manager._id : null,
      managerName: manager ? manager.username : 'None'
    });
    
    // If no manager is assigned, try to find one based on role hierarchy
    if (!manager) {
      let potentialManagerRole;
      
      // Determine what role should be the employee's manager
      switch(employee.role) {
        case 'rm':
          potentialManagerRole = 'rm_head';
          break;
        case 'rm_head':
          potentialManagerRole = 'business_head';
          break;
        case 'business_head':
          potentialManagerRole = 'top_management';
          break;
        default:
          // No applicable manager role
          potentialManagerRole = null;
      }
      
      if (potentialManagerRole) {
        // Try to find a manager with the appropriate role
        const potentialManager = await User.findOne({ role: potentialManagerRole })
          .sort({ CreatedAt: 1 }) // Get the earliest created user with this role
          .select('_id username email role');
          
        if (potentialManager) {
          console.log(`No manager assigned, using ${potentialManager.username} (${potentialManager.role}) as approver`);
          manager = potentialManager;
          
          // Also update the employee's managerId for future requests
          employee.managerId = potentialManager._id;
          await employee.save();
          console.log(`Updated employee's manager to ${potentialManager.username}`);
        }
      }
    }
    
    if (!manager) {
      return res.status(400).json({ 
        error: "No manager found for approval. Please contact your administrator to assign a manager."
      });
    }
    
    // Create the leave request with the manager as approver
    const leave = new LeaveRequest({
      ...req.body, 
      employeeId: req.user._id,
      currentApprover: manager._id
    });
    
    await leave.save();
    
    console.log('Leave request created successfully:', {
      leaveId: leave._id,
      currentApprover: leave.currentApprover,
      approverName: manager.username,
      status: leave.status
    });
    
    res.status(201).json({
      ...leave.toObject(),
      managerName: manager.username, // Include manager name in response
      managerEmail: manager.email
    });
  } catch (err) {
    console.error('Error applying for leave:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /my-requests – Employee sees own leave requests
router.get("/my-requests", async (req, res) => {
  try {
    console.log('Fetching leave requests for user:', req.user._id);
    const leaves = await LeaveRequest.find({ employeeId: req.user._id })
      .populate('approvedBy', 'username email')
      .populate('currentApprover', 'username email')
      .sort({ appliedOn: -1 });
    
    console.log(`Found ${leaves.length} leave requests`);
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /all – Get leaves based on hierarchical access
router.get("/all", async (req, res) => {
  try {
    console.log('Finding all subordinates in hierarchy for manager:', req.user._id);
    
    // Get direct subordinates
    const directSubordinates = await User.find({ managerId: req.user._id }).select("_id role");
    let allSubordinateIds = directSubordinates.map(user => user._id);
    
    // Get user's role to determine hierarchy level
    const currentUser = await User.findById(req.user._id).select("role");
    console.log(`Current user role: ${currentUser.role}`);
    
    // For higher roles, include subordinates of subordinates based on role hierarchy
    if (['top_management', 'business_head', 'rm_head'].includes(currentUser.role)) {
      // Find all users who are hierarchically below the current user
      const processQueue = [...directSubordinates];
      const processed = new Set(allSubordinateIds.map(id => id.toString()));
      
      while (processQueue.length > 0) {
        const current = processQueue.shift();
        
        // Skip processing if we've already processed this user
        if (processed.has(current._id.toString())) continue;
        
        // Find this person's subordinates
        const nextLevelSubordinates = await User.find({ 
          managerId: current._id 
        }).select("_id role");
        
        for (const sub of nextLevelSubordinates) {
          if (!processed.has(sub._id.toString())) {
            processQueue.push(sub);
            allSubordinateIds.push(sub._id);
            processed.add(sub._id.toString());
          }
        }
      }
    }
    
    console.log(`Found ${allSubordinateIds.length} subordinates in hierarchy`);
    
    const leaves = await LeaveRequest.find({
      employeeId: { $in: allSubordinateIds }
    })
    .populate("employeeId", "username email department designation role")
    .populate("approvedBy", "username email")
    .populate("currentApprover", "username email")
    .sort({ appliedOn: -1 });

    console.log(`Found ${leaves.length} leave requests`);
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching all leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    console.log('Fetching pending leave requests for approver:', req.user._id);
    
    // Debug: Check if any pending leave requests exist with this approver
    const pendingCount = await LeaveRequest.countDocuments({
      currentApprover: req.user._id,
      status: "Pending"
    });
    
    console.log(`Total pending leaves with current user as approver: ${pendingCount}`);
    
    // Debug: Check if any leave requests at all exist in the system
    const totalPendingCount = await LeaveRequest.countDocuments({
      status: "Pending"
    });
    
    console.log(`Total pending leaves in system: ${totalPendingCount}`);
    
    // Get the direct leaves for this approver
    const leaves = await LeaveRequest.find({
      currentApprover: req.user._id,
      status: "Pending"
    }).populate("employeeId", "username email department designation role");
    
    // If no direct approvals found but the user is a higher-level manager,
    // let's also try to find any leaves from employees who don't have a direct manager assigned
    if (leaves.length === 0 && ['top_management', 'business_head', 'rm_head'].includes(req.user.role)) {
      // Get employees without a manager who would report to this user's role
      let targetRoles = [];
      
      if (req.user.role === 'top_management') {
        targetRoles = ['business_head'];
      } else if (req.user.role === 'business_head') {
        targetRoles = ['rm_head'];
      } else if (req.user.role === 'rm_head') {
        targetRoles = ['rm'];
      }
      
      console.log(`Checking for pending leaves from employees with roles: ${targetRoles.join(', ')}`);
      
      // Find employees with no manager but whose role matches what this user should manage
      const employeesWithoutManager = await User.find({
        $or: [
          { managerId: { $exists: false } },
          { managerId: null }
        ],
        role: { $in: targetRoles }
      }).select('_id');
      
      const employeeIds = employeesWithoutManager.map(e => e._id);
      
      if (employeeIds.length > 0) {
        console.log(`Found ${employeeIds.length} employees with no manager who should report to this user`);
        
        // Find pending leaves from these employees and assign to current user
        const orphanedLeaves = await LeaveRequest.find({
          employeeId: { $in: employeeIds },
          status: "Pending"
        }).populate("employeeId", "username email department designation role");
        
        console.log(`Found ${orphanedLeaves.length} orphaned leave requests`);
        
        // Update these leaves to set current user as approver
        for (const leave of orphanedLeaves) {
          leave.currentApprover = req.user._id;
          await leave.save();
          
          // Also update the employee record to set this user as their manager
          await User.findByIdAndUpdate(leave.employeeId._id, {
            managerId: req.user._id
          });
          
          console.log(`Updated leave ${leave._id} and employee ${leave.employeeId._id} to set manager to ${req.user.username}`);
        }
        
        // Add these leaves to the response
        leaves.push(...orphanedLeaves);
      }
    }
    
    console.log(`Found ${leaves.length} total pending leave requests for current user`);
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching pending leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});


// POST /:id/status – Hierarchical approval/rejection by managers
router.post("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave || leave.status !== "Pending") {
      return res.status(400).json({ error: "Invalid or already processed leave request" });
    }

    // Verify that the current user is authorized to approve this leave
    if (!leave.currentApprover || leave.currentApprover.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to approve/reject this leave request" });
    }

    // Get employee and current approver information
    const employee = await User.findById(leave.employeeId);
    const approver = await User.findById(req.user._id);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Handle approval based on hierarchy    // Always update the updatedAt field
    leave.updatedAt = new Date();
    
    if (status === "Approved") {
      // If current approver is top_management, final approval
      if (approver.role === "top_management") {
        leave.status = "Approved";
        leave.approvedBy = req.user._id;
        leave.currentApprover = null;
      } 
      // If business_head approved and employee is not rm_head or below, final approval
      else if (approver.role === "business_head" && !["rm_head", "rm"].includes(employee.role)) {
        leave.status = "Approved";
        leave.approvedBy = req.user._id;
        leave.currentApprover = null;
      }
      // If rm_head approved and employee is not rm, final approval
      else if (approver.role === "rm_head" && employee.role !== "rm") {
        leave.status = "Approved";
        leave.approvedBy = req.user._id;
        leave.currentApprover = null;
      }
      // Otherwise, find next approver in hierarchy
      else {
        // Find the manager of the current approver
        const nextApprover = await User.findById(approver.managerId);
        
        if (nextApprover) {
          leave.currentApprover = nextApprover._id;
          console.log(`Leave request forwarded to next approver: ${nextApprover.username}`);
        } else {
          // No higher approver, consider it final approval
          leave.status = "Approved";
          leave.approvedBy = req.user._id;
          leave.currentApprover = null;
        }
      }
    } else if (status === "Rejected") {
      // Any manager in the hierarchy can reject
      leave.status = "Rejected";
      leave.approvedBy = req.user._id;
      leave.currentApprover = null;
    }

    await leave.save();
    
    res.json({ 
      message: status === "Approved" && leave.status !== "Approved" 
        ? "Leave request forwarded to next approver in hierarchy" 
        : `Leave ${status.toLowerCase()} successfully` 
    });
  } catch (err) {
    console.error('Error updating leave status:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /approved-by-me – Get leaves approved/rejected by the current user
router.get("/approved-by-me", async (req, res) => {
  try {
    console.log('Fetching leaves approved/rejected by:', req.user._id);
    const leaves = await LeaveRequest.find({
      approvedBy: req.user._id,
      status: { $in: ["Approved", "Rejected"] }
    })
    .populate("employeeId", "username email department designation role")
    .populate("currentApprover", "username email")
    .sort({ appliedOn: -1 });
    
    console.log(`Found ${leaves.length} leave requests processed by current user`);
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching processed leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG - Fix any leave request with missing or incorrect currentApprover
router.get("/debug/fix-approvers", async (req, res) => {
  try {
    // Only allow admin or top management to run this
    if (!['top_management'].includes(req.user.role)) {
      return res.status(403).json({ error: "Only top management can use this endpoint" });
    }
    
    // Get all pending leave requests with no currentApprover
    const pendingWithNoApprover = await LeaveRequest.find({
      status: "Pending",
      $or: [
        { currentApprover: { $exists: false } },
        { currentApprover: null }
      ]
    }).populate("employeeId", "username email managerId");
    
    console.log(`Found ${pendingWithNoApprover.length} pending leaves with no approver`);
    
    // Fix them by setting currentApprover to the employee's manager
    const fixed = [];
    for (const leave of pendingWithNoApprover) {
      if (leave.employeeId && leave.employeeId.managerId) {
        leave.currentApprover = leave.employeeId.managerId;
        await leave.save();
        fixed.push({
          leaveId: leave._id,
          employee: leave.employeeId.username,
          newApprover: leave.currentApprover
        });
      }
    }
    
    // Also find employees with no managerId assigned
    const employeesWithNoManager = await User.find({
      $or: [
        { managerId: { $exists: false } },
        { managerId: null }
      ],
      role: { $ne: 'top_management' } // Exclude top management, they don't need managers
    }).select("username email role");
    
    res.json({ 
      fixed,
      employeesWithNoManager: employeesWithNoManager.map(e => ({
        _id: e._id,
        username: e.username,
        email: e.email,
        role: e.role
      })),
      fixedCount: fixed.length,
      noManagerCount: employeesWithNoManager.length
    });
  } catch (err) {
    console.error('Error in fix-approvers debug endpoint:', err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG - Bulk fix managers and approvers
router.get("/debug/bulk-fix", async (req, res) => {
  try {
    // Only allow admin or top management to run this
    if (!['top_management'].includes(req.user.role)) {
      return res.status(403).json({ error: "Only top management can use this endpoint" });
    }
    
    const results = { 
      usersFixed: [], 
      leavesFixed: [],
      errors: []
    };
    
    // Step 1: Find all users without managers who should have them
    const usersNoManager = await User.find({
      $or: [
        { managerId: { $exists: false } },
        { managerId: null }
      ],
      role: { $ne: 'top_management' }
    }).select('_id username email role');
    
    console.log(`Found ${usersNoManager.length} users without managers`);
    
    if (usersNoManager.length > 0) {
      // Find possible managers for each role
      const rmHeads = await User.find({ role: 'rm_head' }).select('_id username');
      const businessHeads = await User.find({ role: 'business_head' }).select('_id username');
      const topManagement = await User.find({ role: 'top_management' }).select('_id username');
      
      console.log(`Available managers - RM Heads: ${rmHeads.length}, Business Heads: ${businessHeads.length}, Top Management: ${topManagement.length}`);
      
      // Assign managers based on role hierarchy
      for (const user of usersNoManager) {
        let assignedManager = null;
        
        if (user.role === 'rm' && rmHeads.length > 0) {
          assignedManager = rmHeads[0];
        } else if (user.role === 'rm_head' && businessHeads.length > 0) {
          assignedManager = businessHeads[0];
        } else if (user.role === 'business_head' && topManagement.length > 0) {
          assignedManager = topManagement[0];
        }
        
        if (assignedManager) {
          await User.findByIdAndUpdate(user._id, { managerId: assignedManager._id });
          results.usersFixed.push({
            userId: user._id,
            username: user.username,
            role: user.role,
            assignedManagerId: assignedManager._id,
            assignedManagerName: assignedManager.username
          });
          console.log(`Assigned ${assignedManager.username} as manager for ${user.username} (${user.role})`);
        } else {
          results.errors.push(`Could not find appropriate manager for ${user.username} (${user.role})`);
        }
      }
    }
    
    // Step 2: Find all pending leave requests with no approver
    const pendingNoApprover = await LeaveRequest.find({
      status: 'Pending',
      $or: [
        { currentApprover: { $exists: false } },
        { currentApprover: null }
      ]
    }).populate('employeeId', 'username _id managerId role');
    
    console.log(`Found ${pendingNoApprover.length} pending leave requests with no approver`);
    
    // Fix pending leaves with no approver
    for (const leave of pendingNoApprover) {
      if (!leave.employeeId) {
        results.errors.push(`Leave ${leave._id} has no employee record`);
        continue;
      }
      
      // Re-fetch the employee to get the updated managerId
      const employee = await User.findById(leave.employeeId._id).select('username managerId role');
      
      if (employee && employee.managerId) {
        leave.currentApprover = employee.managerId;
        await leave.save();
        results.leavesFixed.push({
          leaveId: leave._id,
          employee: employee.username,
          assignedApproverId: employee.managerId
        });
      } else {
        results.errors.push(`Could not find manager for ${employee ? employee.username : 'unknown employee'}`);
      }
    }
    
    res.json({
      success: true,
      usersFixed: results.usersFixed.length,
      leavesFixed: results.leavesFixed.length,
      errors: results.errors.length,
      details: results
    });
  } catch (err) {
    console.error('Error in bulk fix:', err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG - Get user hierarchy information
router.get("/debug/hierarchy", async (req, res) => {
  try {
    // Get current user with manager info
    const currentUser = await User.findById(req.user._id)
      .select("username email role managerId")
      .populate("managerId", "username email role _id");
    
    // Get direct subordinates
    const directSubordinates = await User.find({ managerId: req.user._id })
      .select("username email role _id");
    
    // Return the hierarchy information
    res.json({
      currentUser: {
        _id: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        manager: currentUser.managerId ? {
          _id: currentUser.managerId._id,
          username: currentUser.managerId.username,
          role: currentUser.managerId.role
        } : null
      },
      directSubordinates: directSubordinates.map(sub => ({
        _id: sub._id,
        username: sub.username,
        email: sub.email,
        role: sub.role
      })),
      subordinateCount: directSubordinates.length
    });
  } catch (err) {
    console.error('Error fetching hierarchy information:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
