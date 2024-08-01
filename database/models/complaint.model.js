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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
  },
  { timestamps: true }
);


export const complaintModel = mongoose.model("complaint", complaintSchema);
