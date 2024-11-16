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
    isSignUp:{
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
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


export const invitationModel = mongoose.model("invitation", invitationSchema);

