import mongoose from "mongoose";

const vocationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name must be unique."],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

vocationSchema.pre(/^find/, function () {
  this.populate("name");
});

export const vocationModel = mongoose.model("vocation", vocationSchema);

