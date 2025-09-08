import mongoose from "mongoose";

const productLayerSchema = new mongoose.Schema(
  {
    productionCode: { type: String, required: true, index: true }, // barcode or unique layer ID
    glass: { type: mongoose.Schema.Types.ObjectId, ref: "Glass" },
    treatments: [
      {
        treatment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GlassTreatment",
        },
        count: Number,
        measurement: String,
      },
    ],
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    productionLine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productionLine",
    },
    productionDate: { type: Date, required: true },

    currentStep: { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
    currentInventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionInventory",
    },

    productionNotes: String,
    designNumber: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
  },
  { timestamps: true }
);

export default mongoose.models.ProductLayer ||
  mongoose.model("ProductLayer", productLayerSchema);
