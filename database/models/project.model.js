import mongoose from "mongoose";
import { taskModel } from "./tasks.model.js";
import { requsetModel } from "./request.model.js";

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
      enum: ["working", "completed","delayed","waiting"],
      default: "waiting",
      required: true,
    },
    projectPriority: {
      type: String,
      enum: ["medium", "high","low"],
      default: "medium",
      required: true,
    },
    requestForDocumentSubmittalApproval : {
      type: Boolean,
      default: false,
      required: true,
    },
    requestForApprovalOfMaterials: {
      type: Boolean,
      default: false,
      required: true,
    },
    workRequest: {
      type: Boolean,
      default: false,
      required: true,
    },
    tableOfQuantities: {
      type: Boolean,
      default: false,
      required: true,
    },
    requestForInspectionForm: {
      type: Boolean,
      default: false,
      required: true,
    },
    approvalOfSchemes: {
      type: Boolean,
      default: false,
      required: true,
    },
    notes: [
      {
        content: { type: String },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date, default: Date.now },
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
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      // required: true,
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
    progress: {
      type: Number,
      default: 0,
      required: true,
    },
    members: 
      [{ type: mongoose.Schema.Types.ObjectId, ref: "user",default: [],}]
    ,
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "tag",
      default: [],
    },
    isSelected: {
      type: Boolean,
      default: false,
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

projectSchema.post('find', async function(docs) {
  for (let project of docs) {
    const tasks = await taskModel.find({ project: project._id });
    const validTasks = tasks.filter(task => task.type === "toq");
    const totalProgress = validTasks.reduce((sum, task) => sum + task.progress, 0);
    const taskCount = validTasks.length;
    project.progress = taskCount > 0 ? totalProgress / taskCount : 0;
  }
});

projectSchema.post(/^find/, async function (docs, next) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  docs.forEach(async (doc) => {
if(doc){
  if (doc.dueDate && doc.dueDate < new Date() && doc.status !== "completed") {
    doc.status = "delayed";
    doc.save();
  }
  // if (doc.team) {
  //   const team = await teamModel.findOne({ _id: doc.team });
  //   if (team) {
  //     const newMembers = team.members.filter((item) => !doc.members.includes(item));
  //     doc.members.push(...newMembers);
  //   }
  // }
}    
  });

  next();
});

projectSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // Check if the dueDate needs to update the status
  if (update.dueDate && new Date(update.dueDate) < new Date() && update.status !== "completed") {
    this.setUpdate({ ...update, status: "delayed" });
  }


  // If team is being updated
  // if (update.team) {
  //   const team = await teamModel.findOne({ _id: update.team });
  //   if (team) {
  //     // Fetch the current project document to retrieve existing members
  //     const currentProject = await this.model.findOne(this.getQuery());
  //     const currentMembers = currentProject.members || [];
  //     const newMembers = team.members.filter((item) => !currentMembers.includes(item));
  //     this.setUpdate({
  //       ...update,
  //       members: [...currentMembers, ...newMembers]
  //     });
  //   }
  // }

  next();
});

// projectSchema.pre('find', async function (next) {
//   const query = this.getQuery();
//   if (query.team) {
//     const team = await teamModel.findOne({ _id: query.team });
//     if (team) {
//       const newMembers = team.members.filter((item) => !query.members.includes(item));
//       query.members = [...query.members, ...newMembers];
//       this.setQuery(query);
//       await this.save();
//     }
//   }

//   next();
// });

// projectSchema.pre(/^find/, function () {
//   this.populate('members','owner','consultant','contractor','tasks');
// })

projectSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskModel.deleteMany({ project: doc._id });
    await requsetModel.deleteMany({ project: doc._id });
  }
});
export const projectModel = mongoose.model("project", projectSchema);
