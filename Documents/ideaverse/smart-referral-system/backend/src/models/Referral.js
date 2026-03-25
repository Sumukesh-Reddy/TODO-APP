// backend/src/models/Referral.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralId: {
    type: String,
    unique: true,
    default: () => `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  phc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PHC',
    required: true
  },
  phcStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  // Clinical Data
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: [{
    symptom: String,
    severity: { type: Number, min: 1, max: 10 },
    duration: String
  }],
  vitals: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    bloodGlucose: Number
  },
  diagnosis: {
    primary: { type: String, code: String },
    secondary: [{ type: String, code: String }]
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // AI Triage Data
  aiTriage: {
    severityScore: { type: Number, min: 1, max: 5 },
    recommendedSpecialty: String,
    urgencyLevel: {
      type: String,
      enum: ['Immediate', 'Urgent', 'Semi-urgent', 'Non-urgent']
    },
    estimatedWaitTime: Number, // in minutes
    confidence: Number,
    processedAt: Date
  },
  // Referral Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'escalated', 'completed', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    enum: ['capacity_constraint', 'specialty_unavailable', 'insurance_issue', 'other']
  },
  rejectionNote: String,
  appointmentDetails: {
    date: Date,
    time: String,
    slotId: String,
    status: { type: String, enum: ['scheduled', 'completed', 'missed', 'cancelled'] }
  },
  counterReferral: {
    isCounterReferral: { type: Boolean, default: false },
    consultationSummary: String,
    prescriptions: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    followUpSchedule: {
      date: Date,
      type: { type: String, enum: ['clinic', 'telemedicine', 'phc'] }
    },
    redFlagChecklist: [String],
    completedAt: Date
  },
  escalationHistory: [{
    fromHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    toHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    reason: String,
    escalatedAt: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
referralSchema.index({ status: 1, createdAt: -1 });
referralSchema.index({ 'patient._id': 1, status: 1 });
referralSchema.index({ 'hospital._id': 1, status: 1 });
referralSchema.index({ referralId: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);