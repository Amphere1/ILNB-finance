import express from 'express';
import CompanySettings from '../models/companySettingsModel.js';
import verifyToken from '../middleware/auth.js';
import authorize from '../middleware/roleAuth.js';

const router = express.Router();

// Get company settings
router.get('/', verifyToken, authorize(['top_management', 'business_head']), async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await CompanySettings.create({
                companyName: 'ILNB Finance',
                workStartTime: { hour: 9, minute: 0 },
                workEndTime: { hour: 18, minute: 0 },
                lateThresholdMinutes: 15,
                officeLocations: [],
                timezone: 'Asia/Kolkata'
            });
        }
        
        res.status(200).json(settings);
    } catch (error) {
        console.error('Error getting company settings:', error);
        res.status(500).json({ message: 'Server error while fetching company settings' });
    }
});

// Update company settings (main)
router.put('/', verifyToken, authorize(['top_management']), async (req, res) => {
    try {
        const { 
            companyName, 
            workStartTime, 
            workEndTime, 
            lateThresholdMinutes,
            timezone
        } = req.body;

        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            settings = new CompanySettings({
                companyName: companyName || 'ILNB Finance',
                workStartTime: workStartTime || { hour: 9, minute: 0 },
                workEndTime: workEndTime || { hour: 18, minute: 0 },
                lateThresholdMinutes: lateThresholdMinutes || 15,
                timezone: timezone || 'Asia/Kolkata',
                officeLocations: []
            });
        } else {
            // Update only if values are provided
            if (companyName) settings.companyName = companyName;
            if (workStartTime) settings.workStartTime = workStartTime;
            if (workEndTime) settings.workEndTime = workEndTime;
            if (lateThresholdMinutes) settings.lateThresholdMinutes = lateThresholdMinutes;
            if (timezone) settings.timezone = timezone;
        }

        await settings.save();
        res.status(200).json(settings);
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ message: 'Server error while updating company settings' });
    }
});

// Add a new office location
router.post('/office-locations', verifyToken, authorize(['top_management']), async (req, res) => {
    try {
        const { name, address, latitude, longitude, radius } = req.body;

        if (!name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Name, address, latitude, and longitude are required' });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' });
        }

        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            settings = new CompanySettings({
                companyName: 'ILNB Finance',
                workStartTime: { hour: 9, minute: 0 },
                workEndTime: { hour: 18, minute: 0 },
                lateThresholdMinutes: 15,
                timezone: 'Asia/Kolkata',
                officeLocations: []
            });
        }

        // Add the new location
        settings.officeLocations.push({
            name,
            address,
            latitude,
            longitude,
            radius: radius || 100,
            isActive: true
        });

        await settings.save();
        res.status(201).json(settings.officeLocations[settings.officeLocations.length - 1]);
    } catch (error) {
        console.error('Error adding office location:', error);
        res.status(500).json({ message: 'Server error while adding office location' });
    }
});

// Get all office locations
router.get('/office-locations', verifyToken, authorize(['top_management', 'business_head', 'rm_head']), async (req, res) => {
    try {
        const settings = await CompanySettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'No company settings found' });
        }
        
        res.status(200).json(settings.officeLocations);
    } catch (error) {
        console.error('Error fetching office locations:', error);
        res.status(500).json({ message: 'Server error while fetching office locations' });
    }
});

// Update an office location
router.put('/office-locations/:locationId', verifyToken, authorize(['top_management']), async (req, res) => {
    try {
        const { name, address, latitude, longitude, radius, isActive } = req.body;
        const { locationId } = req.params;

        const settings = await CompanySettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Company settings not found' });
        }

        const locationIndex = settings.officeLocations.findIndex(loc => loc._id.toString() === locationId);
        if (locationIndex === -1) {
            return res.status(404).json({ message: 'Office location not found' });
        }

        // Update location fields if provided
        if (name) settings.officeLocations[locationIndex].name = name;
        if (address) settings.officeLocations[locationIndex].address = address;
        if (latitude !== undefined) {
            if (latitude < -90 || latitude > 90) {
                return res.status(400).json({ message: 'Invalid latitude. Must be between -90 and 90.' });
            }
            settings.officeLocations[locationIndex].latitude = latitude;
        }
        if (longitude !== undefined) {
            if (longitude < -180 || longitude > 180) {
                return res.status(400).json({ message: 'Invalid longitude. Must be between -180 and 180.' });
            }
            settings.officeLocations[locationIndex].longitude = longitude;
        }
        if (radius) settings.officeLocations[locationIndex].radius = radius;
        if (isActive !== undefined) settings.officeLocations[locationIndex].isActive = isActive;

        await settings.save();
        res.status(200).json(settings.officeLocations[locationIndex]);
    } catch (error) {
        console.error('Error updating office location:', error);
        res.status(500).json({ message: 'Server error while updating office location' });
    }
});

// Delete an office location
router.delete('/office-locations/:locationId', verifyToken, authorize(['top_management']), async (req, res) => {
    try {
        const { locationId } = req.params;

        const settings = await CompanySettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Company settings not found' });
        }

        const initialLength = settings.officeLocations.length;
        settings.officeLocations = settings.officeLocations.filter(loc => loc._id.toString() !== locationId);

        if (settings.officeLocations.length === initialLength) {
            return res.status(404).json({ message: 'Office location not found' });
        }

        await settings.save();
        res.status(200).json({ message: 'Office location deleted successfully' });
    } catch (error) {
        console.error('Error deleting office location:', error);
        res.status(500).json({ message: 'Server error while deleting office location' });
    }
});

export default router;
