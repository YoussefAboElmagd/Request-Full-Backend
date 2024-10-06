import mongoose from "mongoose";

const groupChatSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name must be unique."],
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
  },
  { timestamps: true }
);



export const groupChatModel = mongoose.model("groupChat", groupChatSchema);

