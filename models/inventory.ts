import mongoose from "mongoose";

export const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["holding", "finished"],
    required: true,
  }
});

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);