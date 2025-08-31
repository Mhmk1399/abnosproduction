import mongoose from "mongoose";

// Invoice item = one ordered product (e.g. 1 laminated glass unit)
const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  designNumber: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
  count: { type: Number, required: true },

  // Side materials for this item (rubbers, spacers, etc.)
  sideMaterials: [{
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: "SideMaterial" },
    quantity: Number,
    price: Number
  }],

  // Layers created from this item
  layers: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductLayer" }]
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productionDate: { type: Date, required: true },
  priority: { type: mongoose.Schema.Types.ObjectId, ref: "Priority" },
  code: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in progress", "completed", "cancelled"],
    default: "pending"
  },
  items: [invoiceItemSchema],
  price: { type: Number, required: true },
  confirmBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  editBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
