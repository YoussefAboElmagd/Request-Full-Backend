import mongoose from "mongoose";
import { documentsModel } from "./documents.model.js";
import { projectModel } from "./project.model.js";
import { removeFiles } from "../../src/utils/removeFiles.js";
import AppError from "../../src/utils/appError.js";

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
    patentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      default: null,
      // required: true,
    },
    total: {
      type: Number,
      default: 0,
      // required: true,
    },
    price: {
      type: Number,
      default: 0,
      // required: true,
    },
    executedQuantity: {
      type: Number,
      default: 0,
      // required: true,
    },
    approvedQuantity: {
      type: Number,
      default: 0,
      // required: true,
    },
    requiredQuantity: {
      type: Number,
      default: 0,
      // required: true,
    },
    invoicedQuantity: {
      type: Number,
      default: 0,
      // required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unit",
      // required: true, 
    },
    taskStatus: {
      type: String,
      enum: ["working", "completed","delayed","waiting"],
      default: "waiting",
      required: true,
    },
    taskPriority: {
      type: String,
      enum: ["medium", "high","low"],
      default: "medium",
      required: true,
    },
    type: {
      type: String,
      enum: ["parent", "sub","milestone","recurring","oneTime"],
      default: "parent",
      // required: true,
    },
    progress: {
      type: Number,
      default: 0,
      required: true,
    },
    isAproved: {
      type: Boolean,
      default: false,
      required: true,
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
      immutask: true,
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

taskSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await projectModel.findOneAndUpdate({ _id: doc.project }, { $pull: { tasks: doc._id } }, { new: true });

    if (doc.documents && doc.documents.length > 0) {
      removeFiles("documents", doc.documents);
      await documentsModel.deleteMany({ _id: { $in: doc.documents } });
    }
  }
});

taskSchema.pre(/^find/, function () {
  this.populate('tags');
})
export const taskModel = mongoose.model("task", taskSchema);
