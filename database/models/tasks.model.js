import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    assignees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
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
      default: 0,
      required: true,
    },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
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
