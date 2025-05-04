import mongoose from "mongoose";

const microLineSchema = new mongoose.Schema(
    {
        name: {
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
        },
        steps: [
           { 
            step:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Step",
                },
            order: {
                type: Number,
                required: true,
                    },
                }
            ]
    },
    { timestamps: true }
);

export default mongoose.models.MicroLine ||
    mongoose.model("MicroLine", microLineSchema);