import LocationHistory from '../models/locationHistoryModel.js';
import { calculateDistance } from './geoUtils.js';

// Thresholds for spoof detection (can be configured)
const SPEED_THRESHOLD_KMH = 1000; // Unrealistic speed for human movement
const ACCURACY_THRESHOLD_METERS = 50; // Acceptable GPS accuracy
const TIME_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes for rapid movement check

// Helper to convert meters/second to km/hour
const msToKmh = (speedMs) => speedMs * 3.6;

// Layer 1: Speed-based detection
// Checks if the reported speed between two consecutive points is unrealistic
const checkSpeedSpoofing = async (userId, newLocation) => {
    const lastLocation = await LocationHistory.findOne({ user: userId }).sort({ timestamp: -1 });

    if (lastLocation) {
        const timeDiffSeconds = (newLocation.timestamp.getTime() - lastLocation.timestamp.getTime()) / 1000;
        if (timeDiffSeconds > 0) {
            const distance = calculateDistance(
                lastLocation.latitude, lastLocation.longitude,
                newLocation.latitude, newLocation.longitude
            );
            const speedMs = distance / timeDiffSeconds;
            const speedKmh = msToKmh(speedMs);

            if (speedKmh > SPEED_THRESHOLD_KMH) {
                console.warn(`Speed spoofing detected for user ${userId}: ${speedKmh.toFixed(2)} km/h`);
                return true; // Spoofing detected
            }
        }
    }
    return false; // No spoofing detected based on speed
};

// Layer 2: Accuracy-based detection
// Checks if GPS accuracy is suspiciously high or low, or fluctuates wildly
const checkAccuracySpoofing = (newLocation) => {
    if (newLocation.accuracy === undefined || newLocation.accuracy === null) {
        // If accuracy is not provided, it's harder to detect spoofing based on this metric
        // Consider this a potential red flag or require accuracy for login
        return false; // Cannot determine based on accuracy
    }

    // Example: suspiciously high accuracy (e.g., 0 meters) or very low accuracy
    if (newLocation.accuracy < 1 || newLocation.accuracy > 1000) { // Adjust thresholds as needed
        console.warn(`Accuracy spoofing detected: unusual accuracy ${newLocation.accuracy}m`);
        return true;
    }
    return false;
};

// Layer 3: Location jump/teleportation detection
// Checks for sudden, impossible jumps in location within a short time frame
const checkTeleportationSpoofing = async (userId, newLocation) => {
    const recentLocations = await LocationHistory.find({
        user: userId,
        timestamp: { $gte: new Date(newLocation.timestamp.getTime() - TIME_THRESHOLD_MS) }
    }).sort({ timestamp: -1 }).limit(5); // Check last 5 locations within time threshold

    if (recentLocations.length > 1) {
        for (let i = 0; i < recentLocations.length - 1; i++) {
            const loc1 = recentLocations[i];
            const loc2 = recentLocations[i + 1];

            const timeDiffSeconds = (loc1.timestamp.getTime() - loc2.timestamp.getTime()) / 1000;
            if (timeDiffSeconds > 0) {
                const distance = calculateDistance(
                    loc1.latitude, loc1.longitude,
                    loc2.latitude, loc2.longitude
                );
                const speedMs = distance / timeDiffSeconds;
                const speedKmh = msToKmh(speedMs);

                if (speedKmh > SPEED_THRESHOLD_KMH) {
                    console.warn(`Teleportation spoofing detected for user ${userId}: impossible speed ${speedKmh.toFixed(2)} km/h between recent points.`);
                    return true;
                }
            }
        }
    }
    return false;
};

// Main function to run all spoof detection layers
const detectGpsSpoofing = async (userId, newLocation) => {
    // Ensure newLocation has timestamp, latitude, longitude, and optionally accuracy
    if (!newLocation.timestamp) newLocation.timestamp = new Date();

    const isSpeedSpoofed = await checkSpeedSpoofing(userId, newLocation);
    if (isSpeedSpoofed) return { isSpoofed: true, reason: 'speed_spoofing' };

    const isAccuracySpoofed = checkAccuracySpoofing(newLocation);
    if (isAccuracySpoofed) return { isSpoofed: true, reason: 'accuracy_spoofing' };

    const isTeleportationSpoofed = await checkTeleportationSpoofing(userId, newLocation);
    if (isTeleportationSpoofed) return { isSpoofed: true, reason: 'teleportation_spoofing' };

    return { isSpoofed: false, reason: null };
};

export { detectGpsSpoofing };