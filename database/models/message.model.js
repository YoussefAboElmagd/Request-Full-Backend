import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    content: {
      type: String,
      default: " ",
      required: true,
    },
    isSender: {
      type: Boolean,
      default: false,
      required: true,
    },
    date: {
      type: String,
      default: "",
    },
    docs: {
      type: [String],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    senderName: {
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

export const messageModel = mongoose.model("message", messageSchema);
