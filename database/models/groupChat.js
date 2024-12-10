import mongoose from "mongoose";

const groupChatSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      required: true,
    },
    project:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

groupChatSchema.pre(/^find/, function () {
  this.populate("users");
})

export const groupChatModel = mongoose.model("groupChat", groupChatSchema);

