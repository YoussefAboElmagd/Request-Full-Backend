import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["onGoing", "ending","delayed" ,"waiting"],
      default: "onGoing",
      required: true,
    },
    // isAproved: {
    //   type: String,
    //   enum: ["aprroved", "Cancelled" ,"waitingForApproval"],
    //   default: "waitingForApproval",
    //   required: true,
    // },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        // required: true,
      },
    ],
    sDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
      // required: true,
    },
    mainConsultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    consultant: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    contractor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "task",
      // required: true,
    },
    budget: {
      type: Number,
      default: 0,
      required: true,
    },
    remaining: {
      type: Number,
      default: 0,
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
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

projectSchema.pre('save', function (next) {
  if (this.dueDate && this.dueDate < new Date()) {
    this.status = "delayed";
  } 
  next();
});

projectSchema.post(/^find/, function (docs, next) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }

  docs.forEach((doc) => {
    if (doc.dueDate && doc.dueDate < new Date()) {
      doc.status = "delayed";
      doc.save();
    }
  });

  next();
});

projectSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.dueDate && new Date(update.dueDate) < new Date()) {
    this.setUpdate({ ...update, status: "delayed" });
  }
//   if (update['$push'] && Array.isArray(update['$push'].members)) {
//     const doc = await this.model.findOne(this.getFilter());
//     if (doc) {
//         const newMembers = update['$push'].members.filter((item) => !doc.members.includes(item));
//         doc.members.push(...newMembers);
//         await doc.save();
//     }
// }
  
  next();
});


// projectSchema.pre(/^find/, function () {
//   this.populate('members','owner','consultant','mainConsultant','contractor','tasks');
// })
export const projectModel = mongoose.model("project", projectSchema);
