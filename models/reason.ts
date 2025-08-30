import mongoose from "mongoose";

const reasonSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    textId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Reason || mongoose.model("Reason", reasonSchema);