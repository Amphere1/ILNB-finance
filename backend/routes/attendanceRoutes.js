import express from 'express';
import Attendance from '../models/attendanceModel.js';
import CompanyLocation from '../models/companyLocationModel.js';
import User from '../models/userModel.js';
import verifyToken from '../middleware/auth.js';
import authorize from '../middleware/roleAuth.js';
import mongoose from 'mongoose';
import { calculateDistance } from '../utils/geoUtils.js';
import { detectGpsSpoofing } from '../utils/spoofDetection.js';
import LocationHistory from '../models/locationHistoryModel.js';

const router = express.Router();

// POST /api/attendance/login - Record employee login
router.post('/login', verifyToken, authorize(['rm', 'rm_head', 'business_head', 'top_management']), async (req, res) => {
    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required for login.' });
    }

    try {
        // GPS Spoofing Detection
        const spoofResult = await detectGpsSpoofing(userId, { latitude, longitude, accuracy, timestamp: new Date() });
        if (spoofResult.isSpoofed) {
            return res.status(403).json({ message: `Potential GPS spoofing detected: ${spoofResult.reason}. Login denied.` });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already logged in today
        const existingAttendance = await Attendance.findOne({ user: userId, date: today });
        if (existingAttendance && existingAttendance.loginTime) {
            return res.status(400).json({ message: 'Already logged in for today.' });
        }

        // Get company location for distance check
        const companyLocation = await CompanyLocation.findOne(); // Assuming one main office for now
        let isOutOfRange = false;
        if (companyLocation) {
            const distance = calculateDistance(latitude, longitude, companyLocation.latitude, companyLocation.longitude);
            if (distance > companyLocation.radius) {
                isOutOfRange = true;
            }
        }

        const newAttendance = new Attendance({
            user: userId,
            loginLocation: { latitude, longitude },
            isOutOfRange,
            date: today
        });

        await newAttendance.save();

        // Save login location to LocationHistory for spoof detection
        const newLocationHistory = new LocationHistory({
            user: userId,
            latitude,
            longitude,
            accuracy: accuracy || null,
            method: 'login'
        });
        await newLocationHistory.save();

        // If out of range, alert manager (this can be a separate notification system later)
        if (isOutOfRange) {
            // Logic to alert manager (e.g., send email, create notification in DB)
            console.log(`Manager alert: User ${req.user.username} logged in out of range.`);
            // For now, just mark managerAlerted as true
            newAttendance.managerAlerted = true;
            await newAttendance.save();
        }

        res.status(201).json({ message: 'Login recorded successfully.', attendance: newAttendance });

    } catch (error) {
        console.error('Error recording login:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// PATCH /api/attendance/logout - Record employee logout
router.patch('/logout', verifyToken, authorize(['rm', 'rm_head', 'business_head', 'top_management']), async (req, res) => {
    const userId = req.user.id;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ user: userId, date: today });

        if (!attendance) {
            return res.status(404).json({ message: 'No login record found for today.' });
        }

        if (attendance.logoutTime) {
            return res.status(400).json({ message: 'Already logged out for today.' });
        }

        attendance.logoutTime = new Date();
        await attendance.save();

        res.status(200).json({ message: 'Logout recorded successfully.', attendance });

    } catch (error) {
        console.error('Error recording logout:', error);
        res.status(500).json({ message: 'Server error during logout.', error: error.message });
    }
});

// GET /api/attendance/my-monthly-report - Get current user's monthly attendance report
router.get('/my-monthly-report', verifyToken, authorize(['rm', 'rm_head', 'business_head', 'top_management']), async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required.' });
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

        const attendanceRecords = await Attendance.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        let totalWorkingHours = 0;
        const dailyRecords = attendanceRecords.map(record => {
            let hours = 0;
            if (record.loginTime && record.logoutTime) {
                hours = (record.logoutTime.getTime() - record.loginTime.getTime()) / (1000 * 60 * 60);
                totalWorkingHours += hours;
            }
            return {
                date: record.date.toISOString().split('T')[0],
                loginTime: record.loginTime ? record.loginTime.toLocaleTimeString() : 'N/A',
                logoutTime: record.logoutTime ? record.logoutTime.toLocaleTimeString() : 'N/A',
                hoursWorked: hours.toFixed(2),
                isOutOfRange: record.isOutOfRange
            };
        });

        res.status(200).json({
            userId,
            month: parseInt(month),
            year: parseInt(year),
            totalWorkingHours: totalWorkingHours.toFixed(2),
            dailyRecords
        });

    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ message: 'Server error fetching monthly report.', error: error.message });
    }
});

// GET /api/attendance/all-monthly-reports - Get all employees' monthly attendance reports (for managers)
router.get('/all-monthly-reports', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required.' });
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

        const attendanceRecords = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$user',
                    records: { $push: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$userDetails.username',
                    email: '$userDetails.email',
                    dailyRecords: {
                        $map: {
                            input: '$records',
                            as: 'record',
                            in: {
                                date: { $dateToString: { format: '%Y-%m-%d', date: '$$record.date' } },
                                loginTime: { $dateToString: { format: '%H:%M:%S', date: '$$record.loginTime' } },
                                logoutTime: { $dateToString: { format: '%H:%M:%S', date: '$$record.logoutTime' } },
                                hoursWorked: {
                                    $cond: {
                                        if: { $and: ['$$record.loginTime', '$$record.logoutTime'] },
                                        then: { $divide: [{ $subtract: ['$$record.logoutTime', '$$record.loginTime'] }, 3600000] },
                                        else: 0
                                    }
                                },
                                isOutOfRange: '$$record.isOutOfRange'
                            }
                        }
                    },
                    totalWorkingHours: {
                        $sum: {
                            $map: {
                                input: '$records',
                                as: 'record',
                                in: {
                                    $cond: {
                                        if: { $and: ['$$record.loginTime', '$$record.logoutTime'] },
                                        then: { $divide: [{ $subtract: ['$$record.logoutTime', '$$record.loginTime'] }, 3600000] },
                                        else: 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(attendanceRecords);

    } catch (error) {
        console.error('Error fetching all monthly reports:', error);
        res.status(500).json({ message: 'Server error fetching all monthly reports.', error: error.message });
    }
});

// GET /api/attendance/out-of-range-logins - Get out-of-range logins for review (for managers)
router.get('/out-of-range-logins', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    try {
        const outOfRangeLogins = await Attendance.find({ isOutOfRange: true, managerAlerted: true, regularized: { $ne: true } })
                                                .populate('user', 'username email')
                                                .sort({ date: -1, loginTime: -1 });

        res.status(200).json(outOfRangeLogins);
    } catch (error) {
        console.error('Error fetching out-of-range logins:', error);
        res.status(500).json({ message: 'Server error fetching out-of-range logins.', error: error.message });
    }
});

// PATCH /api/attendance/regularize-login/:id - Regularize an out-of-range login
router.patch('/regularize-login/:id', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    try {
        const { id } = req.params;
        const attendanceRecord = await Attendance.findById(id);

        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        attendanceRecord.regularized = true; // Add a 'regularized' field to the schema if not present
        await attendanceRecord.save();

        res.status(200).json({ message: 'Login regularized successfully.', attendanceRecord });
    } catch (error) {
        console.error('Error regularizing login:', error);
        res.status(500).json({ message: 'Server error regularizing login.', error: error.message });
    }
});

// POST /api/attendance/company-location - Add/Update company registered location (Admin only)
router.post('/company-location', verifyToken, authorize(['top_management']), async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;

    if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }

    try {
        let companyLocation = await CompanyLocation.findOne();
        if (companyLocation) {
            // Update existing
            companyLocation.name = name;
            companyLocation.latitude = latitude;
            companyLocation.longitude = longitude;
            companyLocation.radius = radius || 500;
            await companyLocation.save();
            res.status(200).json({ message: 'Company location updated successfully.', companyLocation });
        } else {
            // Create new
            companyLocation = new CompanyLocation({ name, latitude, longitude, radius: radius || 500 });
            await companyLocation.save();
            res.status(201).json({ message: 'Company location added successfully.', companyLocation });
        }
    } catch (error) {
        console.error('Error setting company location:', error);
        res.status(500).json({ message: 'Server error setting company location.', error: error.message });
    }
});

// GET /api/attendance/company-location - Get company registered location
router.get('/company-location', verifyToken, authorize(['top_management', 'business_head', 'rm_head', 'rm']), async (req, res) => {
    try {
        const companyLocation = await CompanyLocation.findOne();
        if (!companyLocation) {
            return res.status(404).json({ message: 'Company location not set.' });
        }
        res.status(200).json(companyLocation);
    } catch (error) {
        console.error('Error fetching company location:', error);
        res.status(500).json({ message: 'Server error fetching company location.', error: error.message });
    }
});

export default router;