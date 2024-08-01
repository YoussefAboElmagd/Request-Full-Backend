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
    isShared: {
      type: Boolean,
      default: false,
      required: true,
    },
    token: {
      type: String,
      // required: true,
    },
    tasksPriority: {
      type: String,
      // required: true,
    },
    resources: {
      type: [String],
      // required: true,
    },
    documments: {
      type: [String],
      // required: true,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sDate: {
      type: String,
      required: true,
    },
    eDate: {
      type: String,
      required: true,
    },
    sTime: {
      type: String,
      required: true,
    },
    eTime: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["normal", "shared"],
      default: "normal",
      required: true,
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Cancelled"],
      default: "InProgress",
      required: true,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      // required: true,
    },
    // review: {
    //   type: [
    //     {
    //       review: { type: String},
    //       status: { type: String},
    //       uId: { type: mongoose.Schema.Types.ObjectId, ref: "user"},
    //       createdAt: { type: Date},
    //     },
    //   ],
    //    required: true,
    // },
  },
  { timestamps: true }
);

export const taskModel = mongoose.model("task", taskSchema);
