import mongoose from "mongoose";

const complaintSchema = mongoose.Schema(
  {
    complaintId: {
      type: String,
    },
    content: {
      type: String,
    },
    email: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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

export const complaintModel = mongoose.model("complaint", complaintSchema);
