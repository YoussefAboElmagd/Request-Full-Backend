import mongoose from "mongoose";

const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    billingPeriod: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const planModel = mongoose.model("plan", planSchema);
