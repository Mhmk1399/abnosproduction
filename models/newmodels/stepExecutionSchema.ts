import mongoose from "mongoose";

const stepExecutionSchema = new mongoose.Schema(
  {
    layer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductLayer",
      required: true,
    },
    step: { type: mongoose.Schema.Types.ObjectId, ref: "Step", required: true },
    scannedAt: { type: Date, default: Date.now },
    treatmentsApplied: [
      {
        treatment: { type: mongoose.Schema.Types.ObjectId, ref: "Treatment" },
        count: Number,
        measurement: String,
      },
    ],
    passed: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.StepExecution ||
  mongoose.model("StepExecution", stepExecutionSchema);
