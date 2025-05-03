// models/processEvent.ts - For high-frequency event tracking
import mongoose from "mongoose";

const processEventSchema = new mongoose.Schema(
  {
    layerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "layer",
      required: true,
      index: true,
    },
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "steps",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["start", "complete", "defect", "measurement", "note"],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    workerId: String,
    data: mongoose.Schema.Types.Mixed, // Event-specific data
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "layerId",
      granularity: "seconds",
    },
    // Don't use timestamps as we're managing our own
    timestamps: false,
  }
);

export default mongoose.models.processEvent ||
  mongoose.model("processEvent", processEventSchema);
