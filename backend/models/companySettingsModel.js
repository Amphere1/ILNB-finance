import mongoose from 'mongoose';

const officeLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: -180,
    max: 180
  },
  radius: {
    type: Number,
    required: [true, 'Radius is required'],
    min: 10, // Minimum radius in meters
    default: 100 // Default radius of 100 meters
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const companySettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  workStartTime: {
    hour: {
      type: Number,
      min: 0,
      max: 23,
      default: 9 // 9 AM
    },
    minute: {
      type: Number,
      min: 0,
      max: 59,
      default: 0 // 00 minutes
    }
  },
  workEndTime: {
    hour: {
      type: Number,
      min: 0,
      max: 23,
      default: 18 // 6 PM
    },
    minute: {
      type: Number,
      min: 0,
      max: 59,
      default: 0 // 00 minutes
    }
  },
  lateThresholdMinutes: {
    type: Number,
    min: 0,
    default: 15 // 15 minutes threshold for marking attendance as late
  },
  officeLocations: [officeLocationSchema],
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Pre-save middleware to update the 'updatedAt' field
companySettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure there's only one company settings document
companySettingsSchema.statics.findOneOrCreate = async function(condition, doc) {
  const result = await this.findOne(condition);
  return result || await this.create(doc);
};

const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);

export default CompanySettings;