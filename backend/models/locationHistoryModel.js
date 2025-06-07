import mongoose from 'mongoose';

const locationHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number, // Accuracy of the GPS reading in meters
        required: false
    },
    method: {
        type: String, // e.g., 'login', 'periodic', 'spoof_check'
        required: false
    }
}, { timestamps: true });

const LocationHistory = mongoose.model('LocationHistory', locationHistorySchema);

export default LocationHistory;