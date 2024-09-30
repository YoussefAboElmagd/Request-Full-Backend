import mongoose from "mongoose";
import { documentsModel } from "./documents.model.js";

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
      // required: true,
    },
    tags: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tag",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
    },
    taskStatus: {
      type: String,
      enum: ["working", "completed","delayed","waiting"],
      default: "working",
      required: true,
    },
    taskPriority: {
      type: String,
      enum: ["medium", "high","low"],
      default: "medium",
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        // required: true,
      },
    ],
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre('save', function (next) {
  if (this.dueDate && this.dueDate < new Date()) {
    this.taskStatus = "delayed";
  } 
  next();
});

taskSchema.post(/^find/, function (documents, next) {
  if (!Array.isArray(documents)) {
    documents = [documents]; // Convert to array if it's a single document
  }
  next();
});
taskSchema.post(/^find/, async function (docs) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  docs.forEach(async (doc) => {
if(doc){
  if (doc.dueDate && doc.dueDate < new Date() && doc.taskStatus !== "completed") {
    doc.taskStatus = "delayed";
    doc.save();
  }
  if (doc.documents && doc.documents.length > 0) {
    await documentsModel.updateMany(
      { _id: { $in: doc.documents } },
      { $set: { tag: doc.tags } } 
    );
    doc.save();
}
}
  });
});
taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.dueDate && new Date(update.dueDate) < new Date() && update.status !== "completed") {
    this.setUpdate({ ...update, taskStatus: "delayed" });
  }

  next();
});


taskSchema.pre(/^find/, function () {
  this.populate('tags');
})
export const taskModel = mongoose.model("task", taskSchema);
