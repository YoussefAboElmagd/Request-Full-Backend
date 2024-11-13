import mongoose from "mongoose";
import AppError from "../../src/utils/appError.js";
import { userModel } from "./user.model.js";

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
    isSelected: {
      type: Boolean,
      default: false,
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

tagsSchema.pre("save", async function (req,next) {
  const tag = this;
  // console.log(`tag`, req.query);
  
  // let err = "The `createdBy` user does not exist, cannot save this tag."
  // if(req.query.lang == "ar"){
  //   err = "المستخدم المنشئ غير موجود، لا يمكن حفظ هذه العلامة."
  // }
  const userExists = await mongoose.model("user").exists({ _id: tag.createdBy });

  if (!userExists) {
    const error = new AppError(err,404);
    return next(error);
  }

  next();
});
tagsSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await userModel.updateMany({ tags: doc._id }, { $pull: { tags: doc._id } });
  }
});
export const tagsModel = mongoose.model("tag", tagsSchema);
