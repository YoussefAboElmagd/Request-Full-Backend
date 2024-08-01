import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is a required field."],
      minLength: [2, "Name is too short."],
    },
    phone: {
      type: String,
      required: [true, "Phone is a required field."],
      // minLength: 11,
      unique: [true, "Phone must be unique."],
    },
    otp: {
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
    role: {
      type: String,
      //               مدير المشروع  و استشاري   و مقاول   و مالك    
      enum: [ "admin","owner","contractor","consultant","manger"],
      default: "admin",
      required: true,
    },  
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// userSchema.post("init", (doc) => {
//   doc.profilePic = process.env.BASE_URL + "profilePic/" + doc.profilePic;
// });

// userSchema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, 10);
// });
// userSchema.pre("findOneAndUpdate", function () {
//   if(this._update.password){
//   this._update.password = bcrypt.hashSync(this._update.password, 10);
//   }
// });

export const userModel = mongoose.model("user", userSchema);
