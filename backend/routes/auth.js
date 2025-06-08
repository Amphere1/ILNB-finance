import express from "express";
import User from "../models/userModel.js";
import { roleCanCreate } from "../utils/rolePermissions.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const router = express.Router();

// User login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }        // Create and sign JWT with user role
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                managerId: user.managerId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Token verification route
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Token verification failed' });
    }
});

// Import the verifyToken middleware if it's not already imported
import verifyToken from "../middleware/auth.js";

router.post("/create-subordinate", verifyToken, async (req, res) => {
  try {
    console.log('Received create subordinate request:', req.body);
    console.log('Auth headers:', req.headers.authorization ? 'Present' : 'Missing');
    
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found');
      return res.status(401).json({ 
        message: 'Authentication required',
        details: 'User object not attached to request. Ensure token is valid and middleware is working.'
      });
    }
    
    const creator = await User.findById(req.user._id); // logged-in manager
    if (!creator) {
      console.error('Creator user not found:', req.user._id);
      return res.status(404).json({ message: 'Creator user not found' });
    }
    
    console.log('Creator:', { id: creator._id, role: creator.role, username: creator.username });
    
    // Check required fields
    const requiredFields = ['username', 'email', 'designation', 'department', 'location', 'dateOfJoining', 'role'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    
    const { email, role, username } = req.body;

    // Check role permissions
    if (!roleCanCreate[creator.role]?.includes(role)) {
      console.error(`Role permission denied: ${creator.role} cannot create ${role}`);
      return res.status(403).json({ message: `As a ${creator.role}, you're not allowed to create a ${role}` });
    }
    
    // Check for existing user by email
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      console.error('Email already registered:', email);
      return res.status(400).json({
        message: 'Email already registered'
      });
    }
    
    // Check for existing username
    const existingUserByName = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByName) {
      console.error('Username already taken:', username);
      return res.status(400).json({
        message: 'Username already taken'
      });
    }
    
    // Create a random password
    const rawPassword = crypto.randomBytes(4).toString("hex"); // e.g. "a3f9b2e1"
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    // Format date properly
    let dateOfJoining;
    try {
      dateOfJoining = new Date(req.body.dateOfJoining);
      if (isNaN(dateOfJoining.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (err) {
      console.error('Date parsing error:', err);
      return res.status(400).json({ message: 'Invalid date format for dateOfJoining' });
    }
    
    // Prepare user data with proper types
    const userData = {
      username: req.body.username.trim().toLowerCase(),
      email: req.body.email.trim().toLowerCase(),
      password: hashedPassword,
      role: req.body.role,
      managerId: creator._id,
      designation: req.body.designation.trim(),
      department: req.body.department.trim(),
      location: req.body.location.trim(),
      dateOfJoining
    };
    
    console.log('Creating new user with data:', {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      managerId: userData.managerId,
      designation: userData.designation,
      department: userData.department,
      dateOfJoining: userData.dateOfJoining
    });
    
    // Create the user
    const user = new User(userData);
    
    // Validate the user object before saving
    const validationError = user.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.entries(validationError.errors).reduce((acc, [key, error]) => {
          acc[key] = error.message;
          return acc;
        }, {})
      });
    }

    try {
      // Save the user
      await user.save();
      
      console.log('User created successfully:', user._id);
      
      // Return success response
      res.status(201).json({
        message: "User created",
        generatedPassword: rawPassword, // Display or send via email
        email: user.email
      });
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      // Handle duplicate key errors specifically
      if (saveError.code === 11000) { // MongoDB duplicate key error code
        const field = Object.keys(saveError.keyValue)[0];
        return res.status(400).json({ 
          message: `${field} already exists: ${saveError.keyValue[field]}` 
        });
      }
      throw saveError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error creating subordinate:', error);
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /api/users/change-password
router.put("/change-password", verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(401).json({ error: "Incorrect current password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated" });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("managerId", "username email").select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// DEBUG route to verify authentication is working
router.get("/check-auth", async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: 'Not authenticated',
        headers: req.headers.authorization ? 'Authorization header exists' : 'No auth header'
      });
    }
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    res.status(200).json({
      message: 'Authentication successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      message: 'Authentication check failed',
      error: error.message
    });
  }
});

export default router;
