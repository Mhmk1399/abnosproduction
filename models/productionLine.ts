import mongoose from "mongoose";

const productionLineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    currentStepIndex: [
      {
        stepId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "steps",
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    inventories: [
      {
        inventoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productionInventory",
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    // This array represents the complete order of steps and inventories
    flowOrder: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "flowOrder.itemType",
        },
        itemType: {
          type: String,
          required: true,
          unique: true,
        },
        code: {
          type: String,
          unique: true,
          required: true,
        },
        description: {
          type: String,
        },
        steps: [
          {
            stepId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "steps",
            },
            order: {
              type: Number,
              required: true,
            },
          },
        ],
        inventories: [
          {
            inventoryId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "productionInventory",
            },
            order: {
              type: Number,
              required: true,
            },
          },
        ],
        // This array represents the complete order of steps and inventories
        flowOrder: [
          {
            itemId: {
              type: mongoose.Schema.Types.ObjectId,
              refPath: "flowOrder.itemType",
            },
            itemType: {
              type: String,
              enum: ["steps", "productionInventory"],
            },
            order: {
              type: Number,
              required: true,
            },
          },
        ],
        // Track layers currently in this production line
        layers: [
          {
            layerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "layer",
            },
            currentStepIndex: {
              type: Number,
              default: 0,
            },
            status: {
              type: String,
              enum: ["waiting", "in-progress", "completed", "defective"],
              default: "waiting",
            },
          },
        ],
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.productionLine ||
  mongoose.model("productionLine", productionLineSchema);
