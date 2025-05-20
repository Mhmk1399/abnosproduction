import mongoose from "mongoose";
import glassTreatment from "./glassTreatment";
import productionLine from "./productionLine";

const stepSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["step", "shelf"],
      default: "step",
    },
    // Does this step require a scan?
    requiresScan: {
      type: Boolean,
      default: true,
    },
    // Types of treatments this step performs
    handlesTreatments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: glassTreatment,
      },
    ],

    // Optional auth (e.g., password to allow pass)
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Step || mongoose.model("Step", stepSchema);
