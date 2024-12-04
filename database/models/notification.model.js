import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    icon: {
      type: String,
      default: null,
      required: true,
    },
    message: {
        message_en: { type: String , },
        message_ar: { type: String , },
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isRead:{
      type: Boolean,
      default: false,
      required: true,
    },
    // model: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "model",
    //   immutable: true,
    //   required: true,
    // },
  },
  { timestamps: true }
);

export const notificationModel = mongoose.model(
  "notitication",
  notificationSchema
);
