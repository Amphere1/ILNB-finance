import express from "express";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Test authentication route that just returns the authenticated user
router.get('/auth-test', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Authentication successful',
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    },
    receivedHeaders: {
      authorization: req.headers.authorization ? 'present (starts with: ' + req.headers.authorization.substring(0, 15) + '...)' : 'missing',
      contentType: req.headers['content-type']
    }
  });
});

export default router;
