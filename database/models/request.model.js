import mongoose from "mongoose";

const requsetSchema = mongoose.Schema(
  {
    refNO: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    qty: {
      type: Number,
      // required: true,
    },
    supplier: {
      type: String,
      // required: true,
    },
    // project: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "project",
    //   required: true, 
    // },
    comment: {
      type: [String],
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
    units: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unit",
      // required: true, 
    },
    reason: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"reason"
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    Contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    notedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    submitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

requsetSchema.pre(/^find/, function () {
  this.populate('actionCode');
  this.populate('units');
  this.populate('discipline');
  this.populate('reason');
})

export const requsetModel = mongoose.model("requset", requsetSchema);
