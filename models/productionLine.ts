import mongoose from "mongoose";
import steps from "./steps";
import productionInventory from "./productionInventory";
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
          ref: steps,
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
      ref: productionInventory,
    }
  },
  { timestamps: true }
);

export default mongoose.models.productionLine ||
  mongoose.model("productionLine", productionLineSchema);
