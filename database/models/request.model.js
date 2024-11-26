import mongoose from "mongoose";
import { userModel } from "./user.model.js";
import AppError from "../../src/utils/appError.js";

const requsetSchema = mongoose.Schema(
  {
    refNo: {
      type: String,
      required: true,
    },
    title: {
      type: String,
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
      .model('project')
      .findById(doc.project)
      .select('owner consultant contractor').populate('owner consultant contractor');

    if (project) {
      doc.owner = project.owner || null ;
      doc.consultant = project.consultant|| null ;
      doc.contractor = project.contractor || null ;
    }
  }
}

requsetSchema.pre('save', async function (next) {
  if (this.isNew) {
    await populateOwnerConsultantContractor(this);
    let user = await userModel.findById(this.createdBy);
    this.submitedBy = user.signature;
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
  if(update.ownerStatus || update.contractorStatus || update.consultantStatus){
    if (
      (update.ownerStatus === "rejected" && update.contractorStatus === "rejected")||(update.ownerStatus === "rejected" && update.consultantStatus === "rejected")||(update.contractorStatus === "rejected" && update.consultantStatus === "rejected")
    ) {
      this.setUpdate({ ...update, status: "rejected" });
    }
    if (
      update.ownerStatus === "approved" && update.contractorStatus === "approved" && update.consultantStatus === "approved"
    ) {
      this.setUpdate({ ...update, status: "approved" });
    }
  }
  if(update.firstUpdatedBy){
    let user = await userModel.findById(update.firstUpdatedBy);
    if(!user){
      return new AppError("User not found", 404);
    }
    this.setUpdate({ ...update, notedBy: user.signature });
  }
  if(update.secondUpdatedBy){
    let user = await userModel.findById(update.secondUpdatedBy);
    if(!user){
      return new AppError("User not found", 404);
    }
    this.setUpdate({ ...update, reviewedBy: user.signature });
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
