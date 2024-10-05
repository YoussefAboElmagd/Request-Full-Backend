import mongoose from "mongoose";

const actionCodeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name must be unique."],
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);



export const actionCodeModel = mongoose.model("actionCode", actionCodeSchema);

