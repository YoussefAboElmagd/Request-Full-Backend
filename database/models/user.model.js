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
    presentaddress: {
      type: String,
      // required:true
    },
    city: {
      type: String,
      // required:true
    },
    country: {
      type: String,
      // required:true
    },
    postalCode: {
      type: String,
      // required:true
    },
    verificationCode: {
      type: String,
      // required:true
    },
    idNumber: {
      type: String,
    },
    expiryIdNumber: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    idPhoto: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
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
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userType",
      required: true,
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
    projects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "project",
      default: [],
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

userSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    removeFile("profilePic", doc.profilePic);
  }
});
userSchema.pre(/^find/, function () {
  this.populate("role");
  this.populate("tags");
});
export const userModel = mongoose.model("user", userSchema);
