import mongoose from "mongoose";

const productLayerSchema = new mongoose.Schema(
  {
    productionCode: { type: String, required: true, index: true }, // barcode or unique layer ID
    glass: { type: mongoose.Schema.Types.ObjectId, ref: "Glass" },
    layerNumber: { type: Number, required: true },
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
    designNumber: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thiknes: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    produtionSteps: [
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
    productionDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    currentStep: { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
    currentInventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionInventory",
    },
    productionNotes: String,
  },
  { timestamps: true }
);

export default mongoose.models.ProductLayer ||
  mongoose.model("ProductLayer", productLayerSchema);
