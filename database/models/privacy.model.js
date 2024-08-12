import mongoose from "mongoose";

const privacySchema = mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    content: {
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


export const privacyModel = mongoose.model("privacy", privacySchema);
