import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { removeFile } from "../../src/utils/removeFiles.js";
import { tagsModel } from "./tags.model.js";
import { teamModel } from "./team.model.js";
import { projectModel } from "./project.model.js";
import { messageModel } from "./message.model.js";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is a required field."],
      minLength: [2, "Name is too short."],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is a required field."],
      minLength: 6,
      unique: [true, "Email must be unique."],
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Phone is a required field."],
      minLength: [8, "password is too short , min length 8."],
      unique: [true, "Password must be unique."],
    },
    otp: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      // required:true
    },
    presentAddress: {
      type: String,
      default: "",
      // required:true
    },
    city: {
      type: String,
      default: "",
      // required:true
    },
    country: {
      type: String,
      default: "",
      // required:true
    },
    postalCode: {
      type: String,
      default: "",
      // required:true
    },
    verificationCode: {
      type: String,
      // required:true
    },
    profilePic: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
      default: "",
    },
    electronicStamp: {
      type: String,
      default: "",
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },
    teamMember: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },
    ],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userType",
      default: null,
      // required: true,
    },
    vocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vocation",
      default: null,
      // required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
      default: "672be9c55850d2afb650e488",
      // required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // confirmedEmail: {
    //   type: Boolean,
    //   default: false,
    // },
    confirmedPhone: {
      type: Boolean,
      default: false,
    },
    twoWayAuthentication: {
      type: Boolean,
      default: false,
    },
    offersAndPackages: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: false,
    },
    renewalSubscription: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "tag",
      default: null,
      // required: true,
    },
    access: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    userType: {
      type: String,
      enum: ["user", "admin", "superUser", "assistant"],
      default: "user",
      required: true,
    },
    rights: {
      type: [String], // An array of strings
      default: [], // Optional: default to an empty array
    },

    memberVocation: {
      type: String,
    },

    projects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "project",
      default: [],
    },
    userGroups: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "userGroup",
      default: [],
    },
    lastLogin: {
      type: Date,
    },
    personalNumber: {
      type: Number,
    },
  },
  { timestamps: true }
);

// userSchema.post("init", (doc) => {
//   doc.profilePic = process.env.BASE_URL + "profilePic/" + doc.profilePic;
// });

// userSchema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, Number(process.env.SALTED_VALUE));
// });
userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.SALTED_VALUE)
    );
  }
});
userSchema.pre("findOneAndUpdate", async function () {
  if (this._update.name) {
    await messageModel.updateMany(
      { sender: this._update._id },
      { $set: { senderName: this._update.name } },
      { new: true }
    );
  }
});
userSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await tagsModel.deleteMany({ createdBy: doc._id });
    await teamModel.deleteMany({ createdBy: doc._id });
    await projectModel.deleteMany({ createdBy: doc._id });
    await projectModel.updateMany({ $pull: { members: doc._id } });
    doc.profilePic && removeFile("profilePic", doc.profilePic);
    doc.companyLogo && removeFile("company", doc.companyLogo);
    doc.electronicStamp && removeFile("company", doc.electronicStamp);
    doc.signature && removeFile("company", doc.signature);
  }
});
userSchema.pre(/^find/, function () {
  this.populate("role");
  this.populate("vocation");
  this.populate("projects");
  this.populate("userGroups");
  this.populate("plan");
});
export const userModel = mongoose.model("user", userSchema);
