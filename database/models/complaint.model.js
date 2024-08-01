import mongoose from "mongoose";

const complaintSchema = mongoose.Schema(
  {
    complaintId: {
      type: String,
      // required: true,
    },
    content: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    features: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);


export const complaintModel = mongoose.model("complaint", complaintSchema);
