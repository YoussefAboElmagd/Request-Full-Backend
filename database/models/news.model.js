import mongoose from "mongoose";

const newsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    content: {
      type: String,
      // required: true,
    },
    image: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
  },
  { timestamps: true }
);


export const newsModel = mongoose.model("new", newsSchema);
