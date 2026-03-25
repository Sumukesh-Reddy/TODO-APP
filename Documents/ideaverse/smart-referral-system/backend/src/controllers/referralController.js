// backend/src/controllers/referralController.js
const Referral = require('../models/Referral');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const aiTriageService = require('../services/aiTriageService');
const capacityService = require('../services/capacityService');
const escalationService = require('../services/escalationService');
const notificationService = require('../utils/notificationService');
const logger = require('../utils/logger');

// Create new referral
exports.createReferral = async (req, res) => {
  try {
    const {
      patientId,
      chiefComplaint,
      symptoms,
      vitals,
      attachments
    } = req.body;
    
    const phcStaff = req.user.id;
    const phcId = req.user.phcDetails.phcId;
    
    // 1. Get or create patient
    let patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // 2. Run AI triage
    const aiTriage = await aiTriageService.computeSeverityScore({
      chiefComplaint,
      symptoms,
      vitals
    });
    
    // 3. Create referral
    const referral = new Referral({
      patient: patientId,
      phc: phcId,
      phcStaff: phcStaff,
      chiefComplaint,
      symptoms,
      vitals,
      attachments,
      aiTriage,
      status: 'pending'
    });
    
    await referral.save();
    
    // 4. Log audit trail
    await AuditLog.create({
      action: 'REFERRAL_CREATED',
      entityType: 'referral',
      entityId: referral._id,
      user: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      metadata: {
        referralId: referral.referralId,
        severityScore: aiTriage.severityScore
      }
    });
    
    // 5. Notify hospital managers
    await notificationService.notifyHospitalManagers(referral);
    
    res.status(201).json({
      success: true,
      data: referral,
      message: 'Referral created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating referral',
      error: error.message
    });
  }
};

// Get referrals for hospital manager
exports.getHospitalReferrals = async (req, res) => {
  try {
    const { status, specialty, date } = req.query;
    const hospitalId = req.user.hospitalManagerDetails.hospitalId;
    
    const query = {
      hospital: hospitalId
    };
    
    if (status) query.status = status;
    if (specialty) query['aiTriage.recommendedSpecialty'] = specialty;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    const referrals = await Referral.find(query)
      .populate('patient', 'profile firstName lastName demographics')
      .populate('phc', 'name address')
      .sort({ 'aiTriage.severityScore': -1, createdAt: -1 });
    
    // Get current capacity
    const capacity = await capacityService.getHospitalCapacity(hospitalId);
    
    res.json({
      success: true,
      data: referrals,
      capacity,
      count: referrals.length
    });
    
  } catch (error) {
    logger.error('Error fetching hospital referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referrals'
    });
  }
};

// Accept referral (Hospital Manager)
exports.acceptReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    const hospitalId = req.user.hospitalManagerDetails.hospitalId;
    
    const referral = await Referral.findById(referralId);
    
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    
    if (referral.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Referral already processed' });
    }
    
    // Update referral
    referral.status = 'accepted';
    referral.hospital = hospitalId;
    referral.doctor = doctorId;
    referral.appointmentDetails = {
      date: appointmentDate,
      time: appointmentTime,
      status: 'scheduled'
    };
    
    await referral.save();
    
    // Log audit
    await AuditLog.create({
      action: 'REFERRAL_ACCEPTED',
      entityType: 'referral',
      entityId: referral._id,
      user: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      metadata: {
        referralId: referral.referralId,
        doctorId,
        appointmentDate
      }
    });
    
    // Send notifications
    await notificationService.sendAppointmentNotification(referral);
    
    res.json({
      success: true,
      data: referral,
      message: 'Referral accepted and appointment scheduled'
    });
    
  } catch (error) {
    logger.error('Error accepting referral:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting referral'
    });
  }
};

// Reject referral with auto-escalation
exports.rejectReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { reason, note } = req.body;
    
    const referral = await Referral.findById(referralId);
    
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    
    // Update referral
    referral.status = 'rejected';
    referral.rejectionReason = reason;
    referral.rejectionNote = note;
    
    await referral.save();
    
    // Log audit
    await AuditLog.create({
      action: 'REFERRAL_REJECTED',
      entityType: 'referral',
      entityId: referral._id,
      user: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      metadata: {
        referralId: referral.referralId,
        reason
      }
    });
    
    // Auto-escalate to next hospital
    const escalated = await escalationService.escalateReferral(referral);
    
    res.json({
      success: true,
      data: {
        referral,
        escalated: escalated.escalated,
        nextHospital: escalated.nextHospital
      },
      message: 'Referral rejected and escalated'
    });
    
  } catch (error) {
    logger.error('Error rejecting referral:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting referral'
    });
  }
};

// Complete consultation and create counter-referral
exports.completeConsultation = async (req, res) => {
  try {
    const { referralId } = req.params;
    const {
      diagnosis,
      prescriptions,
      followUpSchedule,
      redFlagChecklist,
      consultationSummary
    } = req.body;
    
    const referral = await Referral.findById(referralId);
    
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    
    // Update with counter-referral data
    referral.diagnosis = diagnosis;
    referral.counterReferral = {
      isCounterReferral: true,
      consultationSummary,
      prescriptions,
      followUpSchedule,
      redFlagChecklist,
      completedAt: new Date()
    };
    referral.status = 'completed';
    referral.appointmentDetails.status = 'completed';
    
    await referral.save();
    
    // Log audit
    await AuditLog.create({
      action: 'COUNTER_REFERRAL_SENT',
      entityType: 'referral',
      entityId: referral._id,
      user: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      metadata: {
        referralId: referral.referralId
      }
    });
    
    // Notify PHC staff
    await notificationService.sendCounterReferralNotification(referral);
    
    res.json({
      success: true,
      data: referral,
      message: 'Consultation completed and counter-referral sent'
    });
    
  } catch (error) {
    logger.error('Error completing consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing consultation'
    });
  }
};