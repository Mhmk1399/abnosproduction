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
    index: true // This is correct
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
    index: true // This is correct
  },
  currentStep: {
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'steps'
    },
    startTime: Date
    // Remove the index: true here - can't add index directly to a subdocument field
  },
  productionLineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'productionLine',
    index: true // This is correct
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

// If you need to index on currentStep.startTime, create a compound index like this:
layerSchema.index({ 'currentStep.startTime': 1 });

// Create indexes for common query patterns
// layerSchema.index({ createdAt: -1 }); // For sorting by creation date
// layerSchema.index({ 'processHistory.stepId': 1, 'processHistory.startTime': -1 }); // For step history queries

export default mongoose.models.layer || mongoose.model("layer", layerSchema);
