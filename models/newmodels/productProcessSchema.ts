// Defines production graph for SKU
import mongoose from "mongoose";

const productProcessSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, index: true },
    version: { type: Number, default: 1 },

    steps: [
      {
        step: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Step",
          required: true,
        },
        isStart: { type: Boolean, default: false },
        isFinal: { type: Boolean, default: false },
        routes: [
          {
            to: { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
            when: mongoose.Schema.Types.Mixed, // condition JSON
            priority: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.ProductProcess ||
  mongoose.model("ProductProcess", productProcessSchema);
