import mongoose from "mongoose";
import { taskModel } from "./tasks.model.js";
import { requsetModel, Sequence } from "./request.model.js";
import axios from 'axios';

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
      enum: ["working", "completed", "delayed", "waiting"],
      default: "waiting",
      required: true,
    },
    projectPriority: {
      type: String,
      enum: ["medium", "high", "low"],
      default: "medium",
      required: true,
    },
    location:String,
    // requestForDocumentSubmittalApproval: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // requestForApprovalOfMaterials: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // workRequest: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // tableOfQuantities: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // requestForInspectionForm: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // approvalOfSchemes: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // requestForDrawingSubmittalApproval: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "request",
    //   default: [],
    //   // required: true,
    // },
    // requestForApprovalOfMaterialsModel: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "request",
    //   default: [],
    //   // required: true,
    // },
    // workRequestModel: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "request",
    //   default: [],
    //   // required: true,
    // },
    // tableOfQuantitiesModel: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref : "request",
    //   default: [],
    //   // required: true,
    // },
    // requestForMaterialAndEquipmentInspection: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "request",
    //   default: [],
    //   // required: true,
    // },
    // approvalOfSchemesModel: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "request",
    //   default: [],
    //   // required: true,
    // },
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
      default: null,
      // required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      // required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
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
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] },
    ],
    tags: {
      type: Array,
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


projectSchema.post("find", async function (docs , next) {
  for (let project of docs) {
    const tasks = await taskModel.find({ project: project._id });
    const validTasks = tasks.filter((task) => task.type === "toq");
    const totalProgress = validTasks.reduce(
      (sum, task) => sum + task.progress,
      0
    );
    const taskCount = validTasks.length;
    project.progress = taskCount > 0 ? totalProgress / taskCount : 0;
    try {
    const apiUrl = `https://api.request-sa.com/api/v1/project/tags/progress/${project._id}`; // Replace with your API endpoint
    const { data } = await axios.get(apiUrl, {
      params: {
        lang: 'en', // Add query parameters if needed
      },
    });
    if (data && data.results) {
      project.tags = data.results;
    }
    next();

  } catch (error) {
    console.log('Proceeding without tag progress due to API error:', error.message);
    next(); // Proceed even if the API call fails
  }
  }
});

projectSchema.post(/^find/, async function (docs, next) {
  if (!Array.isArray(docs)) {
    docs = [docs]; // Convert to array if it's a single document
  }
  docs.forEach(async (doc) => {
    if (doc) {
      if (
        doc.dueDate &&
        doc.dueDate < new Date() &&
        doc.status !== "completed"
      ) {
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

projectSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (
    update.dueDate &&
    new Date(update.dueDate) < new Date() &&
    update.status !== "completed"
  ) {
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

projectSchema.pre(
  /^delete/,
  { document: false, query: true },
  async function () {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await taskModel.deleteMany({ project: doc._id });
      await requsetModel.deleteMany({ project: doc._id });
      await Sequence.findOneAndDelete({ project: doc._id });
    }
  }
);
export const projectModel = mongoose.model("project", projectSchema);
