import mongoose from "mongoose";

const productionInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  Capacity: {
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
  shapeCode: {
    type: String,
    required: true,
    enum: [
      10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30,
    ],
  },
  description: {
    type: String,
  },
});

export default mongoose.models.productionInventory ||
  mongoose.model("productionInventory", productionInventorySchema);
