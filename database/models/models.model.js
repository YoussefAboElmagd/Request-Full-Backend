import mongoose from "mongoose";

const modelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field."],
    },
  },
  { timestamps: true }
);

export const modelModel = mongoose.model("model", modelSchema);
