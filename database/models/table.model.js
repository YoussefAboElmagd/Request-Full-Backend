import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
  {
    // task: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "task",
    //   required: true, 
    // },
    task: {
      type: String,
      required: true, 
    },
    description: {
      type: String,
      required: true,
    },
    sDate: {
      type: Date,
      required: true,
    },
    eDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
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
      required: true,
    },
    approvedQuantity: {
      type: Number,
      required: true,
    },
    requiredQuantity: {
      type: Number,
      required: true,
    },
    filteredQuantity: {
      type: Number,
      required: true,
    },
    units: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unit",
      // required: true, 
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tag",
      required: true,
    },
    priority: {
      type: String,
      enum: ["medium", "high","low"],
      default: "medium",
      required: true,
    },
    assignees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      // required: true,
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    //   required: true,
    // },
    // model: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "model",
    //   immutable: true,
    //   required: true,
    // },
  },
  { timestamps: true }
);

// tableSchema.pre(/^find/, function () {
//   this.populate('actionCode');
//   this.populate('units');
//   this.populate('discipline');
//   this.populate('reason');
// })

export const tableModel = mongoose.model("table", tableSchema);
