import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    layers: {
      maxCount: {
        type: Number,
        required: true,
      },
      minCount: {
        type: Number,
        required: true,
      },
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    sideMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SideMaterial",
      },
    ],
    productLine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionLine",
    },
  },
  { timestamps: true }
);
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
