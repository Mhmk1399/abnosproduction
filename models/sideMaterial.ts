import mongoose from "mongoose";

const sideMaterialSchema = new mongoose.Schema(
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
    weight: {
      type: Number,
      required: false,
    },
    ServiceFee: {
      serviceFeeType: {
        type: String,
        enum: ["percentage", "number"],
        required: true,
        default: "percentage",
      },
      serviceFeeValue: {
        type: Number,
        required: true,
      },
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    detailedAcount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DetailedAccount",
    },
  },
  { timestamps: true }
);
export default mongoose.models.SideMaterial ||
  mongoose.model("SideMaterial", sideMaterialSchema);
