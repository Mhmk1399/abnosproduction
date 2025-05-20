import mongoose from "mongoose";

const productionInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  Capacity:{
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },
    code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    
  }
});

export default mongoose.models.productionInventory ||
  mongoose.model("productionInventory", productionInventorySchema);
