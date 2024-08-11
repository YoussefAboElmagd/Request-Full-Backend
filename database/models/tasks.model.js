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
    isCompleted: {
      type: Boolean,
      default: false,
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
    taskId: {
      type: String,
    },
    documents: {
      type: [String],
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Waiting"],
      default: "InProgress",
      required: true,
    },
    taskType: {
      type: String,
      enum: ["Normal", "High", "Low"],
      default: "Normal",
      required: true,
    },
  },
  { timestamps: true }
);

export const taskModel = mongoose.model("task", taskSchema);
