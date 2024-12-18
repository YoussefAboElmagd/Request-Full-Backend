import mongoose from "mongoose";

const ticketSchema = mongoose.Schema(
  {
    ticketId: {
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
      enum:["inProgress","done","waiting"],
      default:"waiting",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'], // Priority level
      default: 'medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    attachment: {
      type: String,
      default: null, 
    },
  },
  { timestamps: true }
);

export const ticketModel = mongoose.model("ticket", ticketSchema);
