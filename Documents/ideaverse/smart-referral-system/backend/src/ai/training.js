// backend/src/ai/training.js
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class TriageModelTrainer {
  constructor() {
    this.model = null;
    this.modelPath = path.join(__dirname, 'models/triage_model');
  }

  async buildModel() {
    const model = tf.sequential();
    
    // Input layer (features: symptoms, vitals, demographics)
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [50]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    // Output layers
    model.add(tf.layers.dense({
      units: 5, // severity score 1-5
      activation: 'softmax',
      name: 'severity'
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: {
        severity: 'categoricalCrossentropy'
      },
      metrics: ['accuracy']
    });
    
    this.model = model;
    logger.info('Model architecture built');
    
    return model;
  }

  async trainModel(trainingData) {
    try {
      // Prepare features and labels
      const features = [];
      const severityLabels = [];
      
      trainingData.forEach(data => {
        // Extract features
        const featureVector = this.extractFeatures(data);
        features.push(featureVector);
        
        // One-hot encode severity
        const severityOneHot = new Array(5).fill(0);
        severityOneHot[data.severityScore - 1] = 1;
        severityLabels.push(severityOneHot);
      });
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(severityLabels);
      
      // Train the model
      const history = await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            logger.info(`Epoch ${epoch + 1}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
          }
        }
      });
      
      // Save the model
      await this.model.save(`file://${this.modelPath}`);
      logger.info(`Model saved to ${this.modelPath}`);
      
      return history;
      
    } catch (error) {
      logger.error('Error training model:', error);
      throw error;
    }
  }

  extractFeatures(data) {
    const features = [];
    
    // Add symptom features
    data.symptoms.forEach(symptom => {
      features.push(symptom.severity / 10);
    });
    
    // Add vital signs
    if (data.vitals) {
      features.push(data.vitals.temperature ? (data.vitals.temperature - 36) / 4 : 0);
      features.push(data.vitals.heartRate ? data.vitals.heartRate / 200 : 0);
      features.push(data.vitals.oxygenSaturation ? data.vitals.oxygenSaturation / 100 : 0);
      features.push(data.vitals.bloodPressure?.systolic ? data.vitals.bloodPressure.systolic / 200 : 0);
    }
    
    // Pad to fixed length
    while (features.length < 50) {
      features.push(0);
    }
    
    return features;
  }

  async predict(patientData) {
    if (!this.model) {
      await this.loadModel();
    }
    
    const features = this.extractFeatures(patientData);
    const input = tf.tensor2d([features]);
    
    const prediction = await this.model.predict(input);
    const severityScores = await prediction.array();
    
    return {
      severityScores: severityScores[0],
      predictedSeverity: severityScores[0].indexOf(Math.max(...severityScores[0])) + 1,
      confidence: Math.max(...severityScores[0])
    };
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);
      logger.info('Model loaded successfully');
    } catch (error) {
      logger.warn('No existing model found, building new model');
      await this.buildModel();
    }
  }
}

module.exports = new TriageModelTrainer();