import mongoose from "mongoose";
import { documentsModel } from "./documents.model.js";
import { projectModel } from "./project.model.js";
import { removeFiles } from "../../src/utils/removeFiles.js";
import AppError from "../../src/utils/appError.js";
import { taskLogModel } from "./tasksLog.model.js";

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
    sDate: {
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
    attachments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
    },
    parentTask: {
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
      enum: ["working", "completed", "delayed", "waiting"],
      default: "waiting",
      required: true,
    },
    taskPriority: {
      type: String,
      enum: ["medium", "high", "low"],
      default: "medium",
      required: true,
    },
    type: {
      type: String,
      enum: ["toq", "milestone", "recurring", "oneTime"],
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
    recurrenceInterval: { type: Number, default: 1 },
    recurrenceUnit: {
      type: String,
      enum: ["days", "weeks", "months"],
      default: "days",
    },
    recurrenceEndDate: { type: Date },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date, default: Date.now },
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

taskSchema.pre("save", async function (next) {
  if (
    this.dueDate &&
    this.dueDate < new Date() &&
    this.dueDate.toDateString() !== new Date().toDateString() &&
    this.taskStatus !== "completed"
  ) {
    this.taskStatus = "delayed";
  }
  if (this.type === "recurring" && (!this.recurrenceUnit || !this.recurrenceInterval)) {
    return next(new Error("Recurring tasks must have a recurrence unit and interval!"));
  }
  next();
});
taskSchema.post(/^find/, async function (docs) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  docs.forEach(async (doc) => {
    if (doc) {
      if (
        doc.dueDate &&
        doc.dueDate < new Date() &&
        doc.dueDate.toDateString() !== new Date().toDateString() &&
        doc.taskStatus !== "completed"
      ) {
        doc.taskStatus = "delayed";
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
taskSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const taskToUpdate = await mongoose.model("task").findOne(this.getQuery());
  const project = await projectModel.findById(taskToUpdate.project);
  let dueDate = new Date(project.dueDate).toISOString().split("T")[0];
  let sDate = new Date(project.sDate).toISOString().split("T")[0];
  const queryData = this.getOptions().context?.query; // Access the query data
  let err_date_1 = "Start date must be less than due date";
  let err_date_2 = `Due date of task must be less than or equal to ${dueDate} (due date of project) `;
  let err_date_3 = `Start date of task must be less than or equal to ${sDate} (Start date of project) `;
  let err_date_4 = `Start date of task must be less than or equal to ${dueDate} ( End date of project) `;
  if (queryData?.lang == "ar") {
    err_date_1 = "تاريخ البدء يجب ان يكون اقل من تاريخ الانتهاء";
    err_date_2 = `تاريخ الانتهاء يجب ان يكون اقل من او يساوي ${dueDate} (تاريخ انتهاء المشروع) `;
    err_date_3 = `تاريخ البدء يجب ان يكون اقل من او يساوي ${sDate} (تاريخ بدء المشروع) `;
    err_date_4 = `تاريخ البدء يجب ان يكون اقل من او يساوي ${dueDate} (تاريخ انتهاء المشروع) `;
  }
  if (update.dueDate || update.sDate) {
    if (new Date(update.sDate) > new Date(update.dueDate)) {
      return res.status(404).json({ message: err_date_1 });
    }
    if (new Date(update.dueDate) > new Date(project.dueDate)) {
      return res.status(404).json({ message: err_date_2 });
    }
    if (new Date(update.sDate) < new Date(project.sDate)) {
      return res.status(404).json({ message: err_date_3 });
    }
    if (new Date(update.sDate) > new Date(project.dueDate)) {
      return res.status(404).json({ message: err_date_4 });
    }
  }
  next();
});
// taskSchema.pre("findOneAndUpdate", function (next) {
//   const update = this.getUpdate();
//   if (
//     update.dueDate &&
//     new Date(update.dueDate) < new Date() &&
//     update.dueDate.toDateString() !== new Date().toDateString() &&
//     update.status !== "completed"
//   ) {
//     this.setUpdate({ ...update, taskStatus: "delayed" });
//   }

//   next();
// });
taskSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const taskToUpdate = await mongoose.model("task").findOne(this.getQuery());
  const parentTaskId = taskToUpdate?.parentTask || update.parentTask;
  if (parentTaskId) {
    const queryData = this.getOptions().context?.query; // Access the query data
    let err_valid_1 =
      "Required quantity can't be greater than total required quantity";
    let err_valid_2 =
      "Invoiced quantity can't be greater than total invoiced quantity";
    let err_valid_3 =
      "Executed quantity can't be greater than total executed quantity";
    let err_valid_4 =
      "Approved quantity can't be greater than total approved quantity";
    if (queryData.lang == "ar") {
      err_valid_1 =
        "الكمية المطلوبة يجب ان تكون اقل من او يساوي مجموع الكمية المصنعة";
      err_valid_2 =
        "الكمية المفوترة يجب ان تكون اقل من او يساوي مجموع الكمية المفوترة";
      err_valid_3 =
        "الكمية المنفذة يجب ان تكون اقل من او يساوي مجموع الكمية المنفذة";
      err_valid_4 =
        "الكمية المعتمدة يجب ان تكون اقل من او يساوي مجموع الكمية المعتمدة";
    }
    const allSubTasks = await mongoose
      .model("task")
      .find({ parentTask: parentTaskId });
    const parentTask = await mongoose.model("task").findById(parentTaskId);
    let totalInvoicedQuantity =
      update.invoicedQuantity ?? taskToUpdate.invoicedQuantity;
    let totalExecutedQuantity =
      update.executedQuantity ?? taskToUpdate.executedQuantity;
    let totalApprovedQuantity =
      update.approvedQuantity ?? taskToUpdate.approvedQuantity;
    let totalRequiredQuantity =
      update.requiredQuantity ?? taskToUpdate.requiredQuantity;
    allSubTasks.forEach((subTask) => {
      totalInvoicedQuantity += subTask.invoicedQuantity;
      totalExecutedQuantity += subTask.executedQuantity;
      totalApprovedQuantity += subTask.approvedQuantity;
      totalRequiredQuantity += subTask.requiredQuantity;
    });
    if (parentTask.requiredQuantity < totalRequiredQuantity) {
      return next(new AppError(err_valid_1, 400));
    }
    if (parentTask.invoicedQuantity < totalInvoicedQuantity) {
      return next(new AppError(err_valid_2, 400));
    }
    if (parentTask.executedQuantity < totalExecutedQuantity) {
      return next(new AppError(err_valid_3, 400));
    }
    if (parentTask.approvedQuantity < totalApprovedQuantity) {
      return next(new AppError(err_valid_4, 400));
    }
  }
  next();
});

taskSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await projectModel.findOneAndUpdate(
      { _id: doc.project },
      { $pull: { tasks: doc._id } },
      { new: true }
    );
    await taskLogModel.deleteMany({ taskId: doc._id });
    if (doc.documents && doc.documents.length > 0) {
      removeFiles("documents", doc.documents);
      await documentsModel.deleteMany({ _id: { $in: doc.documents } });
    }
  }
});

taskSchema.pre(/^find/, function () {
  this.populate("tags");
  this.populate("unit");
  this.populate("parentTask");
});
export const taskModel = mongoose.model("task", taskSchema);

// requestForDrawingSubmittalApproval: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "request",
//   default: [],
//   // required: true,
// },
// requestForApprovalOfMaterialsModel: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "request",
//   default: [],
//   // required: true,
// },
// workRequestModel: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "request",
//   default: [],
//   // required: true,
// },
// tableOfQuantitiesModel: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref : "request",
//   default: [],
//   // required: true,
// },
// requestForMaterialAndEquipmentInspection: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "request",
//   default: [],
//   // required: true,
// },
// requestForDocumentsubmittalApproval: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "request",
//   default: [],
//   // required: true,
// },
// requestForDocumentSubmittalApproval: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
// requestForApprovalOfMaterials: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
// workRequest: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
// tableOfQuantities: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
// requestForInspectionForm: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
// approvalOfSchemes: {
//   type: Boolean,
//   default: false,
//   required: true,
// },
