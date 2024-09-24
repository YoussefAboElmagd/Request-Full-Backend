import mongoose from "mongoose";
import AppError from "../../src/utils/appError.js";

const tagsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    colorCode: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "model",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

tagsSchema.pre("save", async function (next) {
  const tag = this;

  const userExists = await mongoose.model("user").exists({ _id: tag.createdBy });

  if (!userExists) {
    const error = new AppError("The `createdBy` user does not exist, cannot save this tag.",404);
    return next(error);
  }

  next();
});

export const tagsModel = mongoose.model("tag", tagsSchema);
