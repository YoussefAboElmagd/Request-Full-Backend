import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["success", "warning", ],
      required: true,
    },
    message: {
        message_en: { type: String , },
        message_ar: { type: String , },
    },
    receivers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      required: true,
    },
    // model: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "model",
    //   immutable: true,
    //   required: true,
    // },
  },
  { timestamps: true }
);

// notificationSchema.p(/^find/, async function (docs) {
//   if (!Array.isArray(docs)) {
//     docs = [docs]; // Convert to array if it's a single document
//   }
//   console.log(docs);
  
//   // docs.forEach(async (doc) => {
//   //   if (doc) {
//         docs.forEach((update) => {
//           if (update.message.message_ar !== undefined) {
//             update.message = update.message.message_ar;
//           }
//           if (update.message.message_en !== undefined) {
//             update.message = update.message.message_en;
//           }
      
//           // Remove `message_ar` and `message_en` properties after updating `update.message`
//           delete update.message.message_ar;
//           delete update.message.message_en;
//         });
      
//   //   }
//   // });
// });
export const notificationModel = mongoose.model(
  "notitication",
  notificationSchema
);
