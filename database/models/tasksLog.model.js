import mongoose from "mongoose";

const taskLogSchema = mongoose.Schema(
  {
    updates: [
      {
        changes_en: { type: [String] , },
        changes_ar: { type: [String] , },
        date: {type: Date,default: Date.now,required: true,},
      },
    ],
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
    },
  },
  { timestamps: true }
);

export const taskLogModel = mongoose.model("taskLog", taskLogSchema);