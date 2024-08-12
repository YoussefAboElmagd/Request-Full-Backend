import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field."],
    },
    
    rights:[
      {
        model: { type: mongoose.Schema.Types.ObjectId,
          ref: "model", },
        create: { type: Boolean },
        read: { type: Boolean },
        update: { type: Boolean },
        delete: { type: Boolean },
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// userTypeSchema.post("init", (doc) => {
//   doc.profilePic = process.env.BASE_URL + "profilePic/" + doc.profilePic;
// });

// userTypeSchema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, 10);
// });
// userTypeSchema.pre("findOneAndUpdate", function () {
//   if(this._update.password){
//   this._update.password = bcrypt.hashSync(this._update.password, 10);
//   }
// });

export const userTypeModel = mongoose.model("userType", userTypeSchema);
