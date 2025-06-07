import mongoose from 'mongoose';

const companyLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    radius: {
        type: Number,
        default: 500 // Default radius for accepted login, in meters
    }
}, { timestamps: true });

const CompanyLocation = mongoose.model('CompanyLocation', companyLocationSchema);

export default CompanyLocation;