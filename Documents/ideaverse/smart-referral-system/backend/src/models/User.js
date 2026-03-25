// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['phc_staff', 'hospital_manager', 'doctor', 'patient'],
    required: true
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    profilePicture: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  // Role-specific fields
  phcDetails: {
    phcId: { type: mongoose.Schema.Types.ObjectId, ref: 'PHC' },
    designation: String,
    employeeId: String
  },
  hospitalManagerDetails: {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    department: String,
    employeeId: String
  },
  doctorDetails: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    specialization: String,
    qualifications: [String],
    registrationNumber: String,
    consultationFee: Number
  },
  patientDetails: {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  deviceTokens: [String], // For push notifications
  preferences: {
    language: { type: String, default: 'en' },
    notificationsEnabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

module.exports = mongoose.model('User', userSchema);