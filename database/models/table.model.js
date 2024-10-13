import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
  {
        task: {
          type: String,
          // required: true,
        },
        description: {
          type: String,
          required: true,
        },
        sDate: {
          type: Date,
          // required: true,
        },
        eDate: {
          type: Date,
          // required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          default: 0,
          required: true,
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
          required: true,
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
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "project",
          required: true, 
        },
        tag: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "tag",
          // required: true,
        },
        priority: {
          type: String,
          enum: ["medium", "high","low"],
          default: "medium",
          // required: true,
        },
        assignees: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "user",
          default: [],
          // required: true,
        },
        patentTask: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "table",
          default: null,
          // required: true,
        },
  },
  { timestamps: true }
);


export const tableModel = mongoose.model("table", tableSchema);
