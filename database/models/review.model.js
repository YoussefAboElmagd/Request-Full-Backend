import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const reviewModel = mongoose.model("review", reviewSchema);
