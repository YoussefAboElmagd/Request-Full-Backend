import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const notificationModel = mongoose.model(
  "notitication",
  notificationSchema
);
