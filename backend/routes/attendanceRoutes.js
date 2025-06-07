import express from 'express';
import Attendance from '../models/attendanceModel.js';
import CompanyLocation from '../models/companyLocationModel.js';
import User from '../models/userModel.js';
import CompanySettings from '../models/companySettingsModel.js';
import verifyToken from '../middleware/auth.js';
import authorize from '../middleware/roleAuth.js';
import mongoose from 'mongoose';
import { calculateDistance } from '../utils/geoUtils.js';
import { detectGpsSpoofing } from '../utils/spoofDetection.js';
import LocationHistory from '../models/locationHistoryModel.js';

const router = express.Router();

// POST /api/attendance/test-spoof - Test anti-spoofing system
router.post('/test-spoof', verifyToken, authorize(['top_management']), async (req, res) => {
    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    try {
        // Check GPS spoofing
        const spoofResult = await detectGpsSpoofing(userId, { latitude, longitude, accuracy, timestamp: new Date() });
        
        // Check if location is within any office radius
        const companySettings = await CompanySettings.findOne();
        let isOutOfRange = true;
        let closestOffice = null;
        let minDistance = Infinity;
        
        if (companySettings && companySettings.officeLocations && companySettings.officeLocations.length > 0) {
            for (const location of companySettings.officeLocations.filter(loc => loc.isActive)) {
                const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
                
                // Track closest office and distance
                if (distance < minDistance) {
                    minDistance = distance;
                    closestOffice = {
                        name: location.name,
                        distance: Math.round(distance),
                        radius: location.radius
                    };
                }
                
                // If within radius of any office location, mark as in range
                if (distance <= location.radius) {
                    isOutOfRange = false;
                }
            }
        }
        
        // Save test location to history
        const newLocationHistory = new LocationHistory({
            user: userId,
            latitude,
            longitude, 
            accuracy: accuracy || null,
            method: 'test-spoof'
        });
        await newLocationHistory.save();
        
        return res.status(200).json({
            spoofing: {
                detected: spoofResult.isSpoofed,
                reason: spoofResult.reason
            },
            location: {
                outOfRange: isOutOfRange,
                closestOffice
            }
        });
    } catch (error) {
        console.error('Error in spoof detection test:', error);
        return res.status(500).json({ message: 'Server error during spoof testing.' });
    }
});

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

        // Get company settings for office locations
        const companySettings = await CompanySettings.findOne();
        let isOutOfRange = true; // Default to out of range if no locations are found
        
        // Check distance from all active office locations
        if (companySettings && companySettings.officeLocations && companySettings.officeLocations.length > 0) {
            for (const location of companySettings.officeLocations.filter(loc => loc.isActive)) {
                const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
                // If within radius of any office location, mark as in range
                if (distance <= location.radius) {
                    isOutOfRange = false;
                    break;
                }
            }
        } else {
            // Fall back to the legacy CompanyLocation model if no locations in settings
            const companyLocation = await CompanyLocation.findOne();
            if (companyLocation) {
                const distance = calculateDistance(latitude, longitude, companyLocation.latitude, companyLocation.longitude);
                if (distance <= companyLocation.radius) {
                    isOutOfRange = false;
                }
            }
        }
        
        // Company settings were already retrieved above, use the same object
        // If not already set, provide default values
        if (!companySettings) {
            companySettings = { 
                workStartTime: { hour: 9, minute: 0 }, 
                lateThresholdMinutes: 15,
                officeLocations: []
            };
        }
        
        // Check if login is late
        const now = new Date();
        const expectedStartTime = new Date(today);
        expectedStartTime.setHours(
            companySettings.workStartTime?.hour || 9, 
            companySettings.workStartTime?.minute || 0, 
            0, 0
        );
        
        // Add threshold minutes to get the cutoff time for late marking
        const lateThreshold = new Date(expectedStartTime);
        lateThreshold.setMinutes(lateThreshold.getMinutes() + (companySettings.lateThresholdMinutes || 15));
        
        // Check if current time is past the late threshold
        const isLate = now > lateThreshold;
        let lateMinutes = 0;
        
        if (isLate) {
            // Calculate how many minutes late
            lateMinutes = Math.floor((now - expectedStartTime) / (1000 * 60));
        }

        const newAttendance = new Attendance({
            user: userId,
            loginLocation: { latitude, longitude },
            isOutOfRange,
            isLate,
            lateMinutes,
            date: today,
            loginTime: now
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
    const userRole = req.user.role;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required.' });
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
        
        // Get visible roles based on the user's role (hierarchical access)
        let visibleRoles;
        switch (userRole) {
            case 'top_management':
                visibleRoles = ['top_management', 'business_head', 'rm_head', 'rm']; // Can see everyone
                break;
            case 'business_head':
                visibleRoles = ['business_head', 'rm_head', 'rm']; // Can't see top management
                break;
            case 'rm_head':
                visibleRoles = ['rm_head', 'rm']; // Can't see top management or business head
                break;
            default:
                visibleRoles = []; // Should not happen as route is restricted
        }

        // Get users with roles visible to the current user
        const visibleUsers = await User.find({ role: { $in: visibleRoles } }).select('_id');
        const visibleUserIds = visibleUsers.map(user => user._id);

        const attendanceRecords = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    user: { $in: visibleUserIds } // Only show users based on role hierarchy
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
                    role: '$userDetails.role',
                    department: '$userDetails.department',
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
        const userRole = req.user.role;
        
        // Get visible roles based on the user's role (hierarchical access)
        let visibleRoles;
        switch (userRole) {
            case 'top_management':
                visibleRoles = ['top_management', 'business_head', 'rm_head', 'rm']; // Can see everyone
                break;
            case 'business_head':
                visibleRoles = ['business_head', 'rm_head', 'rm']; // Can't see top management
                break;
            case 'rm_head':
                visibleRoles = ['rm_head', 'rm']; // Can't see top management or business head
                break;
            default:
                visibleRoles = []; // Should not happen as route is restricted
        }

        // Get users with roles visible to the current user
        const visibleUsers = await User.find({ role: { $in: visibleRoles } }).select('_id');
        const visibleUserIds = visibleUsers.map(user => user._id);
        
        const outOfRangeLogins = await Attendance.find({ 
            user: { $in: visibleUserIds }, // Only include users based on role hierarchy
            isOutOfRange: true, 
            managerAlerted: true, 
            regularized: { $ne: true } 
        })
        .populate('user', 'username email role department')
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
        const userRole = req.user.role;
        
        // Find the attendance record and populate user details
        const attendanceRecord = await Attendance.findById(id).populate('user', 'username email role');

        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }
        
        // Check if the current user has permission to regularize this record
        const attendanceUserRole = attendanceRecord.user.role;
        
        let canRegularize = false;
        switch (userRole) {
            case 'top_management':
                canRegularize = true; // Can regularize anyone
                break;
            case 'business_head':
                canRegularize = ['business_head', 'rm_head', 'rm'].includes(attendanceUserRole);
                break;
            case 'rm_head':
                canRegularize = ['rm_head', 'rm'].includes(attendanceUserRole);
                break;
            default:
                canRegularize = false;
        }
        
        if (!canRegularize) {
            return res.status(403).json({ 
                message: 'You do not have permission to regularize this attendance record.' 
            });
        }

        attendanceRecord.regularized = true;
        attendanceRecord.regularizedBy = req.user.id;
        attendanceRecord.regularizedAt = new Date();
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

// GET /api/attendance/month-end-review - Get end of month login review (for managers)
router.get('/month-end-review', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    const { month, year } = req.query;
    const userRole = req.user.role;
    
    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required.' });
    }
    
    try {
        // Get dates for the month
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        
        // Get visible roles based on the user's role (hierarchical access)
        let visibleRoles;
        switch (userRole) {
            case 'top_management':
                visibleRoles = ['top_management', 'business_head', 'rm_head', 'rm']; // Can see everyone
                break;
            case 'business_head':
                visibleRoles = ['business_head', 'rm_head', 'rm']; // Can't see top management
                break;
            case 'rm_head':
                visibleRoles = ['rm_head', 'rm']; // Can't see top management or business head
                break;
            default:
                visibleRoles = []; // Should not happen as route is restricted
        }

        // Get users with visible roles
        const visibleUsers = await User.find({ role: { $in: visibleRoles } }).select('_id');
        const visibleUserIds = visibleUsers.map(user => user._id);
        
        // Find all out-of-range logins for the month that need review
        const outOfRangeLogins = await Attendance.find({
            user: { $in: visibleUserIds }, // Only include users based on role hierarchy
            date: { $gte: startDate, $lte: endDate },
            isOutOfRange: true,
            regularized: { $ne: true }
        }).populate('user', 'username email role department');
        
        // Find all late logins for the month
        const lateLogins = await Attendance.find({
            user: { $in: visibleUserIds }, // Only include users based on role hierarchy
            date: { $gte: startDate, $lte: endDate },
            isLate: true
        }).populate('user', 'username email role department');
        
        res.status(200).json({
            outOfRangeLogins,
            lateLogins,
            totalOutOfRange: outOfRangeLogins.length,
            totalLate: lateLogins.length
        });
    } catch (error) {
        console.error('Error fetching month-end review data:', error);
        res.status(500).json({ 
            message: 'Server error fetching month-end review data.', 
            error: error.message 
        });
    }
});

// PATCH /api/attendance/mark-late-reviewed/:id - Mark a late login as reviewed by manager
router.patch('/mark-late-reviewed/:id', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        
        // Find the attendance record and populate user details
        const attendanceRecord = await Attendance.findById(id).populate('user', 'username email role');

        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }
        
        // Check if the current user has permission to review this record
        const attendanceUserRole = attendanceRecord.user.role;
        
        let canReview = false;
        switch (userRole) {
            case 'top_management':
                canReview = true; // Can review anyone
                break;
            case 'business_head':
                canReview = ['business_head', 'rm_head', 'rm'].includes(attendanceUserRole);
                break;
            case 'rm_head':
                canReview = ['rm_head', 'rm'].includes(attendanceUserRole);
                break;
            default:
                canReview = false;
        }
        
        if (!canReview) {
            return res.status(403).json({ 
                message: 'You do not have permission to review this late login record.' 
            });
        }

        attendanceRecord.managerReviewed = true;
        attendanceRecord.reviewedBy = req.user.id;
        attendanceRecord.reviewedAt = new Date();
        await attendanceRecord.save();

        res.status(200).json({ message: 'Late login marked as reviewed successfully.', attendanceRecord });
    } catch (error) {
        console.error('Error marking late login as reviewed:', error);
        res.status(500).json({ message: 'Server error while reviewing late login.', error: error.message });
    }
});

export default router;