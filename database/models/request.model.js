import mongoose from "mongoose";

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
      required: true,
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
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    notedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    submitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
      enum: ["reviewingFormContractor","reviewingFromConsultant","reviewingFormOwner", "approved", "rejected"],
      default: "reviewingFormContractor",
    },
    ownerApproval: {
      type: Boolean,
      default: false,
    },
    consultantApproval: {
      type: Boolean,
      default: false,
    },
    contractorApproval: {
      type: Boolean,
      default: false,
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
  }
  next();
});

requsetSchema.post(/^find/, async function (docs) {
  if (!Array.isArray(docs)) docs = [docs]; 
  for (const doc of docs) {
    await populateOwnerConsultantContractor(doc);
  }
});

requsetSchema.pre(/^find/, function () {
  this.populate("actionCode");
  this.populate("unit");
  this.populate("discipline");
  this.populate("reason");
  this.populate("createdBy");
  this.populate("submitedBy");
  this.populate("contractor");
  this.populate("owner");
  this.populate("consultant");
  this.populate("reviewedBy");
  this.populate("notedBy");
});

export const requsetModel = mongoose.model("requset", requsetSchema);
