import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    owner: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    contractor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    taskBudget: {
      type: Number,
      required: true,
    },
    documents: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "document",
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Waiting"],
      default: "InProgress",
      required: true,
    },
    taskPriority: {
      type: String,
      enum: ["Normal", "High", "Low"],
      default: "Normal",
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

export const taskModel = mongoose.model("task", taskSchema);
