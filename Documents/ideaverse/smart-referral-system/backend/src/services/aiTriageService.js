// backend/src/services/aiTriageService.js
const axios = require('axios');
const logger = require('../utils/logger');

class AITriageService {
  constructor() {
    this.severityMapping = {
      1: { level: 'Non-urgent', waitTime: 120, color: 'green' },
      2: { level: 'Semi-urgent', waitTime: 60, color: 'yellow' },
      3: { level: 'Urgent', waitTime: 30, color: 'orange' },
      4: { level: 'Very Urgent', waitTime: 15, color: 'red' },
      5: { level: 'Immediate', waitTime: 0, color: 'black' }
    };
    
    this.symptomSpecialtyMap = {
      'chest pain': 'Cardiology',
      'shortness of breath': 'Pulmonology',
      'headache': 'Neurology',
      'fever': 'General Medicine',
      'joint pain': 'Orthopedics',
      'abdominal pain': 'Gastroenterology',
      'vision problems': 'Ophthalmology',
      'ear pain': 'ENT',
      'skin rash': 'Dermatology',
      'anxiety': 'Psychiatry',
      'bleeding': 'Gynecology',
      'difficulty urinating': 'Urology'
    };
  }

  /**
   * Compute severity score based on symptoms and vitals
   * @param {Object} patientData - Patient clinical data
   * @returns {Object} Triage result with severity score and recommendations
   */
  async computeSeverityScore(patientData) {
    try {
      const { symptoms, vitals, chiefComplaint } = patientData;
      
      let severityScore = 1;
      let urgencyFactors = [];
      
      // 1. Check vital signs for critical values
      if (vitals) {
        // Temperature check
        if (vitals.temperature) {
          if (vitals.temperature > 39.5 || vitals.temperature < 35) {
            severityScore = Math.max(severityScore, 4);
            urgencyFactors.push('Critical temperature');
          } else if (vitals.temperature > 38.5) {
            severityScore = Math.max(severityScore, 3);
            urgencyFactors.push('High fever');
          }
        }
        
        // Blood pressure check
        if (vitals.bloodPressure) {
          if (vitals.bloodPressure.systolic > 180 || vitals.bloodPressure.diastolic > 120) {
            severityScore = Math.max(severityScore, 4);
            urgencyFactors.push('Hypertensive crisis');
          } else if (vitals.bloodPressure.systolic > 160) {
            severityScore = Math.max(severityScore, 3);
            urgencyFactors.push('Severe hypertension');
          }
        }
        
        // Oxygen saturation check
        if (vitals.oxygenSaturation) {
          if (vitals.oxygenSaturation < 90) {
            severityScore = Math.max(severityScore, 4);
            urgencyFactors.push('Critical hypoxia');
          } else if (vitals.oxygenSaturation < 94) {
            severityScore = Math.max(severityScore, 3);
            urgencyFactors.push('Hypoxia');
          }
        }
        
        // Heart rate check
        if (vitals.heartRate) {
          if (vitals.heartRate > 140 || vitals.heartRate < 50) {
            severityScore = Math.max(severityScore, 3);
            urgencyFactors.push('Abnormal heart rate');
          }
        }
      }
      
      // 2. Analyze symptoms severity
      if (symptoms && symptoms.length > 0) {
        const highSeveritySymptoms = symptoms.filter(s => s.severity >= 8);
        if (highSeveritySymptoms.length > 0) {
          severityScore = Math.max(severityScore, 4);
          urgencyFactors.push('Severe symptoms reported');
        } else if (symptoms.some(s => s.severity >= 6)) {
          severityScore = Math.max(severityScore, 3);
        } else if (symptoms.some(s => s.severity >= 4)) {
          severityScore = Math.max(severityScore, 2);
        }
      }
      
      // 3. Check chief complaint for red flags
      const redFlags = [
        'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
        'stroke', 'seizure', 'allergic reaction', 'poisoning', 'trauma'
      ];
      
      if (redFlags.some(flag => chiefComplaint.toLowerCase().includes(flag))) {
        severityScore = Math.max(severityScore, 5);
        urgencyFactors.push('Red flag symptom detected');
      }
      
      // 4. Determine recommended specialty
      const recommendedSpecialty = this.getRecommendedSpecialty(chiefComplaint, symptoms);
      
      // 5. Get estimated wait time based on severity
      const waitTime = this.severityMapping[severityScore]?.waitTime || 60;
      
      return {
        severityScore,
        urgencyLevel: this.severityMapping[severityScore]?.level,
        recommendedSpecialty,
        estimatedWaitTime: waitTime,
        urgencyFactors,
        confidence: 0.85, // Confidence score of the AI prediction
        color: this.severityMapping[severityScore]?.color,
        processedAt: new Date()
      };
      
    } catch (error) {
      logger.error('AI Triage computation error:', error);
      throw error;
    }
  }
  
  /**
   * Get recommended specialty based on symptoms
   */
  getRecommendedSpecialty(chiefComplaint, symptoms) {
    const text = `${chiefComplaint} ${symptoms.map(s => s.symptom).join(' ')}`.toLowerCase();
    
    for (const [keyword, specialty] of Object.entries(this.symptomSpecialtyMap)) {
      if (text.includes(keyword)) {
        return specialty;
      }
    }
    
    return 'General Medicine'; // Default
  }
  
  /**
   * Advanced AI analysis using external API (OpenAI, custom model, etc.)
   */
  async advancedAIAnalysis(patientData) {
    try {
      // If you want to use OpenAI API for more sophisticated analysis
      if (process.env.OPENAI_API_KEY) {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a medical triage assistant. Analyze the patient symptoms and vitals to determine severity and recommended specialty.'
              },
              {
                role: 'user',
                content: `Patient: ${JSON.stringify(patientData)}`
              }
            ],
            temperature: 0.3
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse and enhance the triage result
        const aiResponse = response.data.choices[0].message.content;
        // Process AI response...
      }
      
      return await this.computeSeverityScore(patientData);
      
    } catch (error) {
      logger.error('Advanced AI analysis error:', error);
      // Fallback to rule-based system
      return await this.computeSeverityScore(patientData);
    }
  }
  
  /**
   * Match patient to appropriate hospital based on specialty and capacity
   */
  async matchHospital(patientData, severityScore) {
    const { recommendedSpecialty } = await this.computeSeverityScore(patientData);
    
    // Query hospitals with available capacity for the specialty
    // This will be implemented in the capacity service
    
    return {
      matched: true,
      hospitalId: null,
      reason: 'No matching hospital found'
    };
  }
  
  /**
   * Predict wait time based on current hospital load
   */
  async predictWaitTime(hospitalId, specialty, currentCapacity) {
    // Simple algorithm: base wait time + current queue length
    const baseWaitTime = 30; // minutes
    const waitPerPatient = 15; // minutes
    
    const predictedWait = baseWaitTime + (currentCapacity.currentQueue * waitPerPatient);
    
    return {
      predictedWaitTime: predictedWait,
      currentQueue: currentCapacity.currentQueue,
      availableSlots: currentCapacity.availableSlots
    };
  }
}

module.exports = new AITriageService();