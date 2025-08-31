import mongoose from "mongoose";

const productLayerSchema = new mongoose.Schema(
  {
    productionCode: { type: String, required: true, index: true },
    sku: { type: String, required: true }, // moved here
    processVersion: { type: Number, default: 1 }, // version of process graph
    glass: { type: mongoose.Schema.Types.ObjectId, ref: "Glass" },
    treatments: [
      {
        treatment: { type: mongoose.Schema.Types.ObjectId, ref: "Treatment" },
        count: Number,
        measurement: String,
      },
    ],
    width: Number,
    height: Number,

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice.items" },

    currentStep: { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
    currentInventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    productionNotes: String,
    status: {
      type: String,
      enum: ["notoptimized", "optimized", "stopped","deficit","compeleted"],
      default: "notoptimized",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductLayer ||
  mongoose.model("ProductLayer", productLayerSchema);
