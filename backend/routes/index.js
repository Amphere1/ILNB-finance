import express from "express";
import verifyToken from "../middleware/auth.js";
import authorize from "../middleware/roleAuth.js";

const router = express.Router();

// Basic protected route - requires authentication only
router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Welcome to the protected route', user: req.user });
});

// Role-specific routes

// Top management only route
router.get('/management-dashboard', verifyToken, authorize(['top_management']), (req, res) => {
    res.status(200).json({ message: 'Top Management Dashboard Data', user: req.user });
});

// Business heads and above can access
router.get('/business-metrics', verifyToken, authorize(['top_management', 'business_head']), (req, res) => {
    res.status(200).json({ message: 'Business Metrics Data', user: req.user });
});

// RM heads and above can access
router.get('/team-management', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), (req, res) => {
    res.status(200).json({ message: 'Team Management Data', user: req.user });
});

// All authenticated users can access
router.get('/client-management', verifyToken, authorize(['top_management', 'business_head', 'rm_head', 'rm']), (req, res) => {
    res.status(200).json({ message: 'Client Management Data', user: req.user });
});

export default router;