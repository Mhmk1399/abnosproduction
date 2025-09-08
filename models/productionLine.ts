import mongoose from "mongoose";
const productionLineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    steps: [
      {
        step: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Step",
        },
        sequence: {
          type: Number,
          required: true,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionInventory",
    }
  },
  { timestamps: true }
);

export default mongoose.models.productionLine ||
  mongoose.model("productionLine", productionLineSchema);
