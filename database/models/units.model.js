import mongoose from "mongoose";

const unitsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name must be unique."],
      required: true,
    },
  },
  { timestamps: true }
);



export const unitsModel = mongoose.model("unit", unitsSchema);

