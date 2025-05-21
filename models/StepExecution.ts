import mongoose from "mongoose";
import productLayer from "./productLayer";
import steps from "./steps";
import productionLine from "./productionLine";
import glassTreatment from "./glassTreatment";
const stepExecutionSchema = new mongoose.Schema(
  {
    layer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: productLayer,
      required: true,
    },

    step: {
      type: mongoose.Schema.Types.ObjectId,
      ref: steps,
      required: true,
    },

    productionLine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: productionLine,
      required: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },

    treatmentsApplied: [
      {
        treatment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: glassTreatment,
        },
        count: Number,
        measurement: String,
      },
    ],

    passed: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.StepExecution ||
  mongoose.model("StepExecution", stepExecutionSchema);
