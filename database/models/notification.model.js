import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    receivers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
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

export const notificationModel = mongoose.model(
  "notitication",
  notificationSchema
);
