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
      // required: true,
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
      required: true,
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

taskSchema.pre('save', async function (next) {
  if (this.dueDate && this.dueDate < new Date()) {
    this.taskStatus = "delayed";
  } 
  next();
});
// taskSchema.pre("save", async function (next) {
//   if (this.patentTask) {
//       const getAllSUbTasks = await mongoose.model("task").find({parentTask:this.patentTask});
//       const parentTask = await mongoose.model("task").find({_id:this.patentTask});
//       console.log(getAllSUbTasks,"ppp");
//       let totalInvoicedQuantity =this.invoicedQuantity;
//       let totalExecutedQuantity = this.executedQuantity;
//       let totalApprovedQuantity = this.approvedQuantity;
//       let totalRequiredQuantity = this.requiredQuantity;
//       getAllSUbTasks.forEach(async (subTask) => {
//         totalInvoicedQuantity += subTask.invoicedQuantity ;
//         totalExecutedQuantity += subTask.executedQuantity ;
//         totalApprovedQuantity += subTask.approvedQuantity ;
//         totalRequiredQuantity += subTask.requiredQuantity ;
//       })
//       if(parentTask.requiredQuantity < totalRequiredQuantity){
//         next(new AppError("Required quantity can't be greater than total required quantity", 400));
//       }
//       if(parentTask.invoicedQuantity < totalInvoicedQuantity){
//         next(new AppError("Invoiced quantity can't be greater than total Invoiced quantity", 400));
//       }
//       if(parentTask.executedQuantity < totalExecutedQuantity){
//         next(new AppError("Executed quantity can't be greater than total Executed quantity", 400));
//       }
//       if(parentTask.approvedQuantity < totalApprovedQuantity){
//         next(new AppError("Approved quantity can't be greater than total Approved quantity", 400));
//       }
//   }
//     next();
  
// });
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
taskSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const TaskId = this.getQuery()._id;
  
  // Find the current Task document before the update
  const currentTask = await mongoose.model("task").findById(TaskId);
  
  if (currentTask && currentTask.patentTask) {
    const parentTask = await mongoose.model("task").findById(currentTask.patentTask);
    
    if (parentTask) {
      // Subtract current quantities from the parent task before the update
      parentTask.invoicedQuantity -= currentTask.invoicedQuantity || 0;
      parentTask.executedQuantity -= currentTask.executedQuantity || 0;
      parentTask.approvedQuantity -= currentTask.approvedQuantity || 0;
      await parentTask.save();
    }
  }

  next();
});

// taskSchema.post("findOneAndUpdate", async function (doc) {
//   const updatedTask = await mongoose.model("task").findById(doc._id);
  
//   if (updatedTask && updatedTask.patentTask) {
//     const parentTask = await mongoose.model("task").findById(updatedTask.patentTask);

//     if (parentTask) {
//       // Add the updated quantities back to the parent task
//       parentTask.invoicedQuantity += updatedTask.invoicedQuantity || 0;
//       parentTask.executedQuantity += updatedTask.executedQuantity || 0;
//       parentTask.approvedQuantity += updatedTask.approvedQuantity || 0;
//       await parentTask.save();
//     }
//   }
// });

taskSchema.pre(/^find/, function () {
  this.populate('tags');
})
export const taskModel = mongoose.model("task", taskSchema);
