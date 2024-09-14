import mongoose from "mongoose";

const tagsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    colorCode: {
      type: String,
      required: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);



export const tagsModel = mongoose.model("tag", tagsSchema);
