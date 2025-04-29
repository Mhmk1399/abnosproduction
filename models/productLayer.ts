import mongoose from "mongoose";

const productLayerSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    code: {
      type: String,
      required: true,
    },
    glass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Glass",
    },
    treatments: [
      {
        treatment: {type:mongoose.Schema.Types.ObjectId, ref: "Treatment"},
        count: {
          type: Number
        },
        measurement: {
          type: String,
        },
      },
    ],
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    diliveryDate: {
      type: Date,
      required: true,
    },
    productionCode: {
      type: String,
      required: true,
    },
    productionLine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionLine",
    },
    productionDate: {
      type: Date,
      required: true,
    },
    currentStep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "steps",
    
    },
    productionNotes: {
      type: String,
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
      required: true,
    }

  },
  { timestamps: true }
);
export default mongoose.models.ProductLayer || mongoose.model("ProductLayer", productLayerSchema);