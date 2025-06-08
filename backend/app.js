import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import companySettingsRoutes from './routes/companySettingsRoutes.js';
import leaveRoutes from './routes/leaves.js';
import employeeRoutes from './routes/employees.js';
import debugRoutes from './routes/debug.js';
import "./config/passport.js";
import seedAdmin from "./config/seedAdmin.js";
import setupCronJobs from './cronJobs.js';
import cors from 'cors';

dotenv.config();

const app = express();

// Configure CORS with proper options
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('Server is working correctly');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/company-settings', companySettingsRoutes);
app.use('/api', indexRoutes);
app.use('/api/leave', leaveRoutes);
app.use("/api/employees", employeeRoutes);
app.use('/api/debug', debugRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Seed admin user
    seedAdmin();
    // Setup cron jobs
    setupCronJobs();
  })
  .catch(error => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});