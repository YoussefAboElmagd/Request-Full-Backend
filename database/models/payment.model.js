import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    cardNumber: {
      type: Number,
    },
    cvvCode: {
      type: Number,
    },
    cardHolderName: {
      type: String,
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
export const paymentModel = mongoose.model("payment", paymentSchema);
