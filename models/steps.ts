import mongoose from "mongoose";

const stepsSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true

    },
    code: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
    }


}, { timestamps: true })



export default mongoose.models.Steps || mongoose.model("Steps", stepsSchema);
