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
      default:null,
      // required: true,
    },
    supplier: {
      type: String,
      default:null,
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
      ref:"reason" ,
      default: null,

      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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
      default:null,
      // required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default:null,
      // required: true,
    },
    notedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default:null,
      // required: true,
    },
    submitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default:null,
      // required: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
    consultantsComment:{  
    type: [String],
    default: [],
  },
    approvedMaterialSubmittalNo : {
      type : Number,
      default:null,
      //required : true
    },
    boqItemNo : {
      type : Number,
      default:null,
      //required : true
    },
    deliveryNoteNo : {
      type : Number,
      default:null,
      //required : true
    }
  },
  { timestamps: true }
);

requsetSchema.pre(/^find/, function () {
  this.populate('actionCode');
  this.populate('unit');
  this.populate('discipline');
  this.populate('reason');
})

export const requsetModel = mongoose.model("requset", requsetSchema);
