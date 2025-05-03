import mongoose from "mongoose";

const productionInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    requeired: true,
  },
  code: {
    type: String,
    unique: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
  },
});

export default mongoose.models.productionInventory ||
  mongoose.model("productionInventory", productionInventorySchema);
