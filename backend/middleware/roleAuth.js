/**
 * Role-based authorization middleware for ILNB Finance CRM
 * This middleware checks if the authenticated user has the required role(s) to access a route
 */

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // User must be authenticated first (verifyToken middleware should be used before this)
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // If no specific roles are required or user is top_management (has access to everything)
        if (!allowedRoles || allowedRoles.length === 0 || req.user.role === 'top_management') {
            return next();
        }

        // Check if user's role is in the allowed roles
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        // Access denied
        return res.status(403).json({ 
            message: 'Access denied: Insufficient permissions' 
        });
    };
};

/**
 * Role hierarchy for reference:
 * - top_management: Access to everything
 * - business_head: Access to business metrics, team management
 * - rm_head: Access to RM team management
 * - rm: Basic access to client management
 */

export default authorize;