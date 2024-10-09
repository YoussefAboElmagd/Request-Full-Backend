import mongoose from "mongoose";
import { taskModel } from "./tasks.model.js";
import { removeFiles } from "../../src/utils/removeFiles.js";

const documentsSchema = mongoose.Schema(
  {
    document: {
      type: String,
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tag",
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      // required: true,
    },
  },
  { timestamps: true }
);
documentsSchema.pre(/^find/, function () {
  this.populate("uploadedBy", "task");
});
documentsSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskModel.findOneAndUpdate({ _id: doc.task }, { $pull: { documents: doc._id } }, { new: true });
    if (doc.document) {
      removeFiles("documents", doc.document);
    }
  }
});
export const documentsModel = mongoose.model("document", documentsSchema);
