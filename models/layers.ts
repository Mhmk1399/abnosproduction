// models/layer.ts
import mongoose from "mongoose";

const layerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  batchId: {
    type: String,
    required: true,
    index: true // Index for faster queries by batch
  },
  dimensions: {
    width: Number,
    height: Number,
    thickness: Number
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'defective'],
    default: 'waiting',
    index: true // Index for status-based queries
  },
  currentStep: {
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'steps'
    },
    startTime: Date,
    index: true // Index for current step queries
  },
  productionLineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'productionLine',
    index: true // Index for production line queries
  },
  // Store the complete history separately to keep this document lighter
  processHistory: [{
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'steps'
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    workerId: String,
    status: {
      type: String,
      enum: ['completed', 'defective', 'in-progress'],
      required: true
    },
    notes: String,
    measurements: mongoose.Schema.Types.Mixed // Flexible field for step-specific data
  }],
  metadata: mongoose.Schema.Types.Mixed // For any additional data
}, { 
  timestamps: true,
  // Use time-to-live index for automatic data cleanup of old records
  // This is optional and depends on your data retention policy
  expires: 60*60*24*365 // 1 year in seconds
});

// Create indexes for common query patterns
layerSchema.index({ createdAt: -1 }); // For sorting by creation date
layerSchema.index({ 'processHistory.stepId': 1, 'processHistory.startTime': -1 }); // For step history queries

export default mongoose.models.layer || mongoose.model("layer", layerSchema);
