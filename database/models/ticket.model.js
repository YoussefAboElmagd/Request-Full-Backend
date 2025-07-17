import mongoose from "mongoose";

const ticketSchema = mongoose.Schema(
  {
    ticketNumber: {
      type: String,
    },
    subject: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["inProgress", "solved", "waiting"],
      default: "waiting",
    },
    email: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    attachment: {
      type: String,
      default: null,
    },

    response: String,
  },
  { timestamps: true }
);

export const ticketModel = mongoose.model("ticket", ticketSchema);
