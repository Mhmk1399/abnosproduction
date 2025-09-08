import mongoose from "mongoose";

const stepSchema: mongoose.Schema = new mongoose.Schema(
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
        ref: "GlassTreatment",
      },
    ],
    productlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductLayer",
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
