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
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "tag",
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

taskSchema.post(/^find/, function (documents, next) {
  if (!Array.isArray(documents)) {
    documents = [documents]; // Convert to array if it's a single document
  }
  next();
});
taskSchema.post(/^find/, async function (docs) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  const currentDate = new Date();
  
  // Check if docs is an array (when using find) or a single document
  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (doc.dueDate && doc.dueDate < currentDate) {
        doc.isDelayed = true;
        await doc.save(); // Save if delayed
      }
    }
  }
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
