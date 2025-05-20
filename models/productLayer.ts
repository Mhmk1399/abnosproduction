import mongoose from "mongoose";
import glass from "@/models/glass";
import glassTreatment from "@/models/glassTreatment";
import product from "@/models/product";
import invoice from "@/models/invoice";
import productionLine from "@/models/productionLine";
import steps from "@/models/steps";
import productionInventory from "@/models/productionInventory";
import design from "@/models/design";


const productLayerSchema = new mongoose.Schema({
  productionCode: { type: String, required: true, index: true }, // barcode or unique layer ID
  glass: { type: mongoose.Schema.Types.ObjectId, ref: glass },
  treatments: [
    {
      treatment: { type: mongoose.Schema.Types.ObjectId, ref: glassTreatment },
      count: Number,
      measurement: String,
    },
  ],
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: product },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: invoice },
  productionLine: { type: mongoose.Schema.Types.ObjectId, ref: productionLine },
  productionDate: { type: Date, required: true },

  currentStep: { type: mongoose.Schema.Types.ObjectId, ref: steps },
  currentInventory: { type: mongoose.Schema.Types.ObjectId, ref: productionInventory },

  productionNotes: String,
  designNumber: { type: mongoose.Schema.Types.ObjectId, ref: design },
}, { timestamps: true });


export default mongoose.models.ProductLayer || mongoose.model("ProductLayer", productLayerSchema);