import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["success", "warning", ],
      required: true,
    },
    message: {
        message_en: { type: String , },
        message_ar: { type: String , },
    },
    receivers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
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
