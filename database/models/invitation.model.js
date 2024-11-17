import mongoose from "mongoose";

const invitationSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    project:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    role:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "userType",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    isSignUp:{
      type: Boolean,
      default: false,
    },
    isApproved:{
      type: Boolean,
      default: false,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);


export const invitationModel = mongoose.model("invitation", invitationSchema);

