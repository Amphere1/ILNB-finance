import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import leaveRoutes from './routes/leaves.js';
import "./config/passport.js";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('Server is working correctly');
});

app.use('/api/auth', authRoutes);
app.use('/api', indexRoutes);
app.use('/api/leave', leaveRoutes);


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});