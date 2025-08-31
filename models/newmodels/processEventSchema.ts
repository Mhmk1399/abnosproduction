import mongoose from "mongoose";

const processEventSchema = new mongoose.Schema(
  {
    layerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductLayer",
      required: true,
      index: true,
    },
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["start", "complete", "defect", "measurement", "note"],
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    workerId: String,
    data: mongoose.Schema.Types.Mixed,
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "layerId",
      granularity: "seconds",
    },
    timestamps: false,
  }
);

export default mongoose.models.ProcessEvent ||
  mongoose.model("ProcessEvent", processEventSchema);
