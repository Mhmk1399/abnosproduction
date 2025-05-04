import mongoose from "mongoose";

const productionLineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    microLines: [
                  { 
                    microLine: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "MicroLine",
                    },
                    order: {
                      type: Number,
                      required: true, 
                    }
                  }
                   ],
        active: {
          type: Boolean,
          default: true,
        },
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        }
      },
  { timestamps: true }
);

export default mongoose.models.productionLine ||
  mongoose.model("productionLine", productionLineSchema);
