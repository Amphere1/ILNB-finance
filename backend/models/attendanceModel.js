import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        required: false
    },
    loginLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    isOutOfRange: {
        type: Boolean,
        default: false
    },
    managerAlerted: {
        type: Boolean,
        default: false
    },
    regularized: {
        type: Boolean,
        default: false
    },
    isLate: {
        type: Boolean,
        default: false
    },
    lateMinutes: {
        type: Number,
        default: 0
    },
    managerReviewed: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date(new Date().setHours(0,0,0,0))
    }
}, { timestamps: true });

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;