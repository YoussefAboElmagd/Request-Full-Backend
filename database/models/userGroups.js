import mongoose from "mongoose";

const userGroupSchema = mongoose.Schema(
  {
    name:{
      type: String,
      required: true,
    },
    users:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      required: true,
    },
    tags:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "tag",
      required: true,
    },
    rights:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "userType",
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



export const userGroupModel = mongoose.model("userGroup", userGroupSchema);

