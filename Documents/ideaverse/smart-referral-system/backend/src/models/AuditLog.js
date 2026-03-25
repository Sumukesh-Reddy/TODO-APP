// backend/src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'REFERRAL_CREATED',
      'REFERRAL_VIEWED',
      'REFERRAL_ACCEPTED',
      'REFERRAL_REJECTED',
      'REFERRAL_ESCALATED',
      'DOCTOR_ASSIGNED',
      'APPOINTMENT_SET',
      'CONSULTATION_COMPLETED',
      'PRESCRIPTION_ISSUED',
      'COUNTER_REFERRAL_SENT',
      'PATIENT_REGISTERED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'CAPACITY_UPDATED',
      'SCHEDULE_UPDATED'
    ]
  },
  entityType: {
    type: String,
    enum: ['referral', 'patient', 'doctor', 'user', 'hospital', 'department'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    role: String,
    ipAddress: String
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    referralId: String,
    hospitalId: mongoose.Schema.Types.ObjectId,
    departmentId: mongoose.Schema.Types.ObjectId,
    deviceInfo: String,
    userAgent: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for reporting
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ 'user.userId': 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);