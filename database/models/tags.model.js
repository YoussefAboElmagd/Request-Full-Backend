import mongoose from "mongoose";

const tagsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field."],
    },
    colorCode: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);



export const tagsModel = mongoose.tags("tag", tagsSchema);
