import mongoose from "mongoose";
import { userModel } from "./user.model.js";
import AppError from "../../src/utils/appError.js";
import { sendNotification } from "../../src/utils/sendNotification.js";

const requsetSchema = mongoose.Schema(
  {
    refNo: {
      type: Number,
      // required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "requestForDocumentSubmittalApproval",
        "requestForApprovalOfMaterials",
        "workRequest",
        "tableOfQuantities",
        "requestForInspectionForm",
        "approvalOfSchemes",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      default: null,
      // required: true,
    },
    supplier: {
      type: String,
      default: null,
      // required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      default: null,
      // required: true,
    },
    comment: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: true,
    },
    discipline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "discipline",
      required: true,
    },
    actionCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "actionCode",
      // required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unit",
      default: null,
      // required: true,
    },
    reason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reason",
      default: null,
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    firstUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    secondUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    reviewedBy: {
      type: String,
      default: null,
      // required: true,
    },
    notedBy: {
      type: String,
      default: null,
      // required: true,
    },
    submitedBy: {
      type: String,
      default: null,
      // required: true,
    },
    ownerCompanyLogo: {
      type: String,
      default: null,
      // required: true,
    },
    consultantCompanyLogo: {
      type: String,
      default: null,
      // required: true,
    },
    contractorCompanyLogo: {
      type: String,
      default: null,
      // required: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
    consultantsComment: {
      type: [String],
      default: [],
    },
    approvedMaterialSubmittalNo: {
      type: Number,
      default: null,
      //required : true
    },
    boqItemNo: {
      type: Number,
      default: null,
      //required : true
    },
    deliveryNoteNo: {
      type: Number,
      default: null,
      //required : true
    },
    cell: {
      type: Number,
      default: null,
      //required : true
    },
    quantity: {
      type: Number,
      default: null,
      //required : true
    },
    remarks: {
      type: String,
      default: null,
      //required : true
    },
    location: {
      type: String,
      default: null,
      //required : true
    },
    workArea: {
      type: String,
      default: null,
      //required : true
    },
    inspectionDate: {
      type: Date,
      default: null,
      // required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    ownerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    consultantStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    contractorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    sent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

async function populateOwnerConsultantContractor(doc) {
  if (doc.project) {
    const project = await mongoose
      .model("project")
      .findById(doc.project)
      .select("owner consultant contractor")
      .populate("owner consultant contractor");

    if (project) {
      doc.owner = project.owner || null;
      doc.consultant = project.consultant || null;
      doc.contractor = project.contractor || null;
      doc.ownerCompanyLogo =
        `https://api.request-sa.com/${project.ownerCompanyLogo}` || null;
      doc.consultantCompanyLogo =
        `https://api.request-sa.com/${project.consultantCompanyLogo}` || null;
      doc.contractorCompanyLogo =
        `https://api.request-sa.com/${project.contractorCompanyLogo}` || null;
    }
  }
}
const sequenceSchema = mongoose.Schema({
  project: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Sequence = mongoose.model("sequence", sequenceSchema);

requsetSchema.pre("save", async function (next) {
  if (this.isNew) {
    await populateOwnerConsultantContractor(this);
    let user = await userModel.findById(this.createdBy);
    this.submitedBy = `https://api.request-sa.com/${user.signature}`;
    if (this.createdBy.toString() == this.owner?._id.toString()) {
      this.ownerStatus = "approved";
    } else if (this.createdBy.toString() == this.contractor?._id.toString()) {
      this.contractorStatus = "approved";
    } else if (this.createdBy.toString() == this.consultant?._id.toString()) {
      this.consultantStatus = "approved";
    } else {
      return next(new AppError("Unauthorized user", 401));
    }
    const sequence = await Sequence.findOneAndUpdate(
      { project: this.project },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.refNo = sequence.seq;
  }
  next();
});

requsetSchema.post(/^find/, async function (docs) {
  if (!Array.isArray(docs)) docs = [docs];
  for (const doc of docs) {
    await populateOwnerConsultantContractor(doc);
  }
});

requsetSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (
    update.ownerStatus ||
    update.contractorStatus ||
    update.consultantStatus
  ) {
    const model = await mongoose.model("requset").findOne(this.getQuery());
    const receivers = [
      model.owner?._id,
      model.contractor?._id,
      model.consultant?._id,
    ];
    if (
      (update.ownerStatus === "rejected" &&
        update.contractorStatus === "rejected") ||
      (update.ownerStatus === "rejected" &&
        update.consultantStatus === "rejected") ||
      (update.contractorStatus === "rejected" &&
        update.consultantStatus === "rejected")
    ) {
      let message_en = "The Model has been rejected !";
      let message_ar = "النموذج تم رفضه !";
      sendNotification(message_en, message_ar, "warning", receivers);
      this.setUpdate({ ...update, status: "rejected" });
    }
    if (
      update.ownerStatus === "approved" &&
      update.contractorStatus === "approved" &&
      update.consultantStatus === "approved"
    ) {
      let message_en = "The Model has been approved !";
      let message_ar = "النموذج تم الموافقة عليه ! ";
      sendNotification(message_en, message_ar, "warning", receivers);
      this.setUpdate({ ...update, status: "approved" });
    }
  }
  if (update.firstUpdatedBy) {
    let user = await userModel.findById(update.firstUpdatedBy);
    if (!user) {
      return new AppError("User not found", 404);
    }
    this.setUpdate({
      ...update,
      notedBy: `https://api.request-sa.com/${user.signature}`,
    });
  }
  if (update.secondUpdatedBy) {
    let user = await userModel.findById(update.secondUpdatedBy);
    if (!user) {
      return new AppError("User not found", 404);
    }
    this.setUpdate({
      ...update,
      reviewedBy: `https://api.request-sa.com/${user.signature}`,
    });
  }

  next();
});
requsetSchema.pre(/^find/, function () {
  this.populate("actionCode");
  this.populate("unit");
  this.populate("discipline");
  this.populate("reason");
  this.populate("createdBy");
  this.populate("contractor");
  this.populate("owner");
  this.populate("consultant");
  this.populate("firstUpdatedBy");
  this.populate("secondUpdatedBy");
});

export const requsetModel = mongoose.model("requset", requsetSchema);
