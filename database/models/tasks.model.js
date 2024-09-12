import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    assignees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      // required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // taskBudget: {
    //   type: Number,
    //   default: 0,
    //   required: true,
    // },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
    },
    taskStatus: {
      type: String,
      enum: ["completed", "working", "waiting"],
      default: "working",
      required: true,
    },
    taskPriority: {
      type: String,
      enum: ["medium", "high", "low"],
      default: "medium",
      required: true,
    },
    isDelayed: {
      type: Boolean,
      default: false,
    },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        // required: true,
      },
    ],
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre('save', function (next) {
  if (this.dueDate && this.dueDate < new Date()) {
    this.isDelayed = true;
  } else {
    this.isDelayed = false;
  }
  next();
});

taskSchema.post(/^find/, function (docs, next) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  docs.forEach((doc) => {
    if (doc.dueDate && doc.dueDate < new Date()) {
      doc.isDelayed = true;
      doc.save();
    }
  });

  next();
});
taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.dueDate && new Date(update.dueDate) < new Date()) {
    this.setUpdate({ ...update, isDelayed: true });
  } else if (update.dueDate) {
    this.setUpdate({ ...update, isDelayed: false });
  }
  if(update.taskStatus === "completed"){
    this.setUpdate({ ...update, isDelayed: false });
  }
  next();
});


// taskSchema.pre(/^find/, function () {
//   this.populate('assignees');
// })
export const taskModel = mongoose.model("task", taskSchema);
