import mongoose from "mongoose";

const productionInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["holding", "finished"],
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.models.productionInventory ||
  mongoose.model("productionInventory", productionInventorySchema);
