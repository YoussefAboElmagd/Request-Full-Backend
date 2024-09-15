import mongoose from "mongoose";

const requsetSchema = mongoose.Schema(
  {
    refNO: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    comment: {
      type: [String],
    },
    date: {
      type: Date,
      required: true,
    },
    discipline: {
      type: String,
      enum: ["civil", "architectural", "mechanical","electrical","other"],
      required: true,
    },
    actionCode: {
      type: String,
      enum: ["approved", "aprovedWithNote", "rejected","rejectedResubmit"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["removal", "installation", "testing","commissioning",],
      // required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "document",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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


export const requsetModel = mongoose.model("requset", requsetSchema);
