import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { removeFile } from "../../src/utils/removeFiles.js";

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
      required: [true, "Phone is a required field."],
      minLength: 9,
      unique: [true, "Phone must be unique."],
    },
    password: {
      type: String,
      required: [true, "Phone is a required field."],
      minLength: 8,
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
      immutable: true,
      required: true,
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "tag",
      default: [],
      // required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userType",
      required: true,
    },
    vocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vocation",
      default: null,
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
    isSuperUser: {
      type: Boolean,
      default: false,
    },
    // projects: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "project",
    //   default: [],
    // },
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

userSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    removeFile("profilePic", doc.profilePic);
  }
});
userSchema.pre(/^find/, function () {
  this.populate("role");
  this.populate("tags");
  this.populate("vocation");
});
export const userModel = mongoose.model("user", userSchema);
