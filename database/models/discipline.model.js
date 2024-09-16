import mongoose from "mongoose";

const disciplineSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name must be unique."],
      required: true,
    },
  },
  { timestamps: true }
);



export const disciplineModel = mongoose.model("discipline", disciplineSchema);

