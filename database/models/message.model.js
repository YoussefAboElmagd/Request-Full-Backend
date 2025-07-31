import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      // required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    content: {
      type: String,
      default: null,
      // required: true,
    },
    type: {
      type: String,
      enum:["text","doc","voiceNote"],
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
      type: String,
    },
    voiceNote: {
      type: [String],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groupChat",
      default: null,
    },
    // senderName: {
    //   type: String,
    //   required: true,
    // },
    // model: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "model",
    //   immutable: true,
    //   required: true,
    // },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function () {
    // this.populate("sender");
    // this.populate("receiver");
    this.populate("group");
})

export const messageModel = mongoose.model("message", messageSchema);
