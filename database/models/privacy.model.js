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
  },
  { timestamps: true }
);


export const privacyModel = mongoose.model("privacy", privacySchema);
