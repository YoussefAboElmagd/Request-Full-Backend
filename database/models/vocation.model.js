import mongoose from "mongoose";

const vocationSchema = mongoose.Schema(
  {
    nameEN: {
      type: String,
      required: true,
    },
    nameAR: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

// vocationSchema.pre(/^find/, function () {
//   this.populate("nameEn");
//   this.populate("nameAR");
// });

export const vocationModel = mongoose.model("vocation", vocationSchema);

