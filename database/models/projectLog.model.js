import mongoose from "mongoose";

const projectLogSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default:undefined,
    },
    status: {
      type: String,
      enum: ["onGoing", "ending", "waiting"],
      default: "onGoing",
      default:undefined,
    },
    notes: [
      {
        content: { type: String ,default:undefined},
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user",default:undefined, },
      },
    ],
    sDate: {
      type: String,
      default:undefined,
    },
    eDate: {
      type: String,
      default:undefined,
    },
    documents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "document",
      default:undefined,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default:undefined,
    },
    contractor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default:undefined,
    },
    owner: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default:undefined,
    },
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "task",
      default:undefined,
    },
    budget: {
      type: Number,
      default:undefined,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default:undefined,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const projectLogModel = mongoose.model("projectLog", projectLogSchema);
