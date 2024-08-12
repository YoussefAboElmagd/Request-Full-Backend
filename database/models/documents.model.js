import mongoose from "mongoose";

const documentsSchema = mongoose.Schema(
  {
    document: {
      type: String,
      // required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    status:{
      type: String,
      enum: [ "pending","approved","rejected"],
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
    // model: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "model",
    //   immutable: true,
    //   required: true,
    // },
    },
  { timestamps: true }
);


export const documentsModel = mongoose.model("document", documentsSchema);
