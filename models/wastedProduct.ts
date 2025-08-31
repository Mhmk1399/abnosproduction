import mongoose from "mongoose";

const wastedProductSchema = new mongoose.Schema(
  {
    layerWidth: {
      type: Number,
      required: true,
    },
    wastedWidth: {
      type: Number,
      required: true,
    },
    layerHeight: {
      type: Number,
      required: true,
    },
    wastedHeight: {
      type: Number,
      required: true,
    },
    reason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reason",
      required: true,
    },
    step: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WastedProduct || mongoose.model("WastedProduct", wastedProductSchema);