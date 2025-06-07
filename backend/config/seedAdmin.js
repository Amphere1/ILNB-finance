import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ilnbfinance.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Function to seed admin user
async function seedAdmin() {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Create admin user
    const adminUser = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'top_management'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

export default seedAdmin;