import mongoose from "mongoose";

const teamSchema = mongoose.Schema(
  {
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
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


teamSchema.post(/^find/, function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      doc.memberCount = doc.members ? doc.members.length : 1;
    });
  } else if (docs) {
    docs.memberCount = docs.members ? docs.members.length : 1;
  }
});

export const teamModel = mongoose.model("team", teamSchema);
