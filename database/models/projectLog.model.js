import mongoose from "mongoose";

const projectLogSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      enum: ["onGoing", "ending", "waiting"],
      default: "onGoing",
      // required: true,
    },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        // required: true,
      },
    ],
    sDate: {
      type: String,
      // required: true,
    },
    eDate: {
      type: String,
      // required: true,
    },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
      // required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    contractor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      // required: true,
    },
    owner: {
      type: [mongoose.Schema.Types.ObjectId],
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
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
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

export const projectLogModel = mongoose.model("projectLog", projectLogSchema);
