import mongoose from "mongoose";

const stepSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String,
    type: { type: String, enum: ["step", "wait", "shelf"], default: "step" },
    requiresScan: { type: Boolean, default: true },

    // If this step applies treatments
    handlesTreatments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Treatment" },
    ],

    // For synchronization (e.g., wait for 2 layers before continuing)
    waitGroup: { type: String }, // e.g. "pairGroup", "dgGroup"
  },
  { timestamps: true }
);

export default mongoose.models.Step || mongoose.model("Step", stepSchema);
