// backend/src/models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  specialization: {
    type: String,
    required: true,
    enum: ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 
           'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'Oncology',
           'Gastroenterology', 'Nephrology', 'Urology', 'Endocrinology', 'Pulmonology']
  },
  qualifications: [{
    degree: String,
    institution: String,
    yearOfPassing: Number,
    registrationNumber: String
  }],
  consultationCapacity: {
    dailyLimit: { type: Number, default: 20 },
    currentBookings: { type: Number, default: 0 },
    bufferTime: { type: Number, default: 15 } // minutes between appointments
  },
  schedule: [{
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0-6 Sunday to Saturday
    startTime: String, // "09:00"
    endTime: String,   // "17:00"
    isAvailable: { type: Boolean, default: true },
    slotDuration: { type: Number, default: 30 } // minutes per slot
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to check availability for a given date
doctorSchema.methods.isAvailableAtTime = function(date, time) {
  const dayOfWeek = date.getDay();
  const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  const appointmentTime = time; // "14:30"
  if (appointmentTime < daySchedule.startTime || appointmentTime >= daySchedule.endTime) {
    return false;
  }
  
  return this.consultationCapacity.currentBookings < this.consultationCapacity.dailyLimit;
};

module.exports = mongoose.model('Doctor', doctorSchema);