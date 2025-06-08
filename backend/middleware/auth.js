import passport from "passport";

const verifyToken = (req, res, next) => {
    // Log auth header to help with debugging
    console.log('Auth header exists:', !!req.headers.authorization);
    if (req.headers.authorization) {
        console.log('Auth header format check:', req.headers.authorization.startsWith('Bearer '));
        console.log('Auth header value:', req.headers.authorization);
    }
    
    // Ensure Authorization header is correctly formatted
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        console.error('Invalid Authorization header format');
        return res.status(401).json({
            message: 'Invalid Authorization header format',
            details: 'The Authorization header must be in format: Bearer <token>'
        });
    }
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Auth error:', err);
            return res.status(500).json({ message: 'Authentication error', details: err.message });
        }
        
        if (!user) {
            console.log('Auth failed:', info?.message);
            return res.status(401).json({ 
                message: info?.message || 'Unauthorized',
                details: 'Token invalid or expired'
            });
        }

        // Log successful authentication
        console.log(`User authenticated: ${user.username} (${user._id})`);
        req.user = user;
        next();
    })(req, res, next);
};

export default verifyToken;