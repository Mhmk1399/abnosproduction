import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // internal code
    shapeCode: { type: String, required: true }, // e.g., "RECT", "SQUARE", "CIRCLE"

    layers: {
      maxCount: { type: Number, required: true },
      minCount: { type: Number, required: true },
    },

    sideMaterials: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SideMaterial" },
    ],
    defaultProcess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductProcess",
    },
    detailedAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DetailedAccount",
    },

    requiresSecurite: { type: Boolean, default: false },
    requiresDoubleGlazing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
