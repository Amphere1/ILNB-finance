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
                username: user.name,
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


router.post("/create-subordinate", async (req, res) => {
  const creator = await User.findById(req.user._id); // logged-in manager
  const { email, role } = req.body;

 if (!roleCanCreate[creator.role]?.includes(role)) {
  return res.status(403).json({ message: `As a ${creator.role}, you're not allowed to create a ${role}` });
}
   const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

  const rawPassword = crypto.randomBytes(4).toString("hex"); // e.g. "a3f9b2e1"
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = new User({
    ...req.body,
    password: hashedPassword,
    managerId: creator._id
  });

  await user.save();
  res.status(201).json({
    message: "User created",
    generatedPassword: rawPassword, // Display or send via email
    email: user.email
  });
});

// PUT /api/users/change-password
router.put("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(401).json({ error: "Incorrect current password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated" });
});

router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("managerId", "name email").select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

export default router;
