import mongoose from "mongoose";
import { taskModel } from "./tasks.model.js";
import { removeFiles } from "../../src/utils/removeFiles.js";

const documentsSchema = mongoose.Schema(
  {
    path: {
      type: String,
    },
    filename: {
      type: String,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    comment: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tag",
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      //
    },
  },
  { timestamps: true }
);
documentsSchema.pre(/^find/, function () {
  this.populate("uploadedBy", "task");
});
documentsSchema.pre(
  /^delete/,
  { document: false, query: true },
  async function () {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await taskModel.findOneAndUpdate(
        { _id: doc.task },
        { $pull: { documents: doc._id } },
        { new: true }
      );
      if (doc.document) {
        removeFiles("documents", doc.document);
      }
    }
  }
);
export const documentsModel = mongoose.model("document", documentsSchema);
