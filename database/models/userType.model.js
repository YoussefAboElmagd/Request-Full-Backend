import mongoose from "mongoose";

const userTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    rights: [
      {
        model: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "model",
          required: true,
        },
        create: { type: Boolean, required: true },
        read: { type: Boolean, required: true },
        update: { type: Boolean, required: true },
        delete: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);
userTypeSchema.pre(/^find/, function () {
  this.populate("rights.model");
});

export const userTypeModel = mongoose.model("userType", userTypeSchema);
