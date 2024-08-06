import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [ "onGoing","ending"],
      default: "onGoing",
      required: true,
    },
    notes: {
      type: String,
      // required: true,
    },
    sDate: {
      type: String,
      required: true,
    },
    eDate: {
      type: String,
      required: true,
    },
    documments: {
      type: [String],
      // required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    contractor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "task",
      // required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const projectModel = mongoose.model(
  "project",
  projectSchema
);
