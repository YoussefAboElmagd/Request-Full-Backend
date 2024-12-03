import { notificationModel } from "../../../database/models/notification.model.js";
import { sio } from "../../../server.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllNotification = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = null;
  const DaysAgo = new Date();
  let day = Number(req.query.days) || 7;
  DaysAgo.setDate(DaysAgo.getDate() - day);
  results = await notificationModel
    .find({
      receivers: { $in: [id] },
      createdAt: { $gte: DaysAgo },
    })
    .sort({ $natural: -1 });
  // if (results.length > 0) {
  //   results.forEach((update) => {
  //     if (update.message.message_ar !== undefined) {
  //       update.message = update.message.message_ar;
  //     }
  //     else if (update.message.message_en !== undefined) {
  //       update.message = update.message.message_en;
  //     }
  //     delete update.message.message_ar;
  //     delete update.message.message_en;
  //   });
  // }

  res.json({ message: "Done", results });
});

const createNotification = catchAsync(async (req, res, next) => {
  // req.body.model = "66ba0122ff7376971c929636";

  const newNotif = new notificationModel(req.body);
  const savedNotif = await newNotif.save();
  let message = req.body.message;
  let type = req.body.type;

  if (!Array.isArray(req.body.receivers)) {
    req.body.receivers = [req.body.receivers];
  }
  let receivers = req.body.receivers;
  sio.emit(`notification_`, { message }, { type }, { receivers });

  res.status(201).json({
    message: "notification created successfully!",
    savedNotif,
  });
});

const deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "Couldn't Delete!  not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يمكن المسح!  غير موجود";
  }
  const deletedNotification = await notificationModel.findByIdAndDelete(id);

  if (!deletedNotification) {
    return res.status(404).json({ message: err_1 });
  }

  res.status(200).json({ message: "notification deleted successfully!" });
});
const clearNotification = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_1 = "Couldn't Delete!  not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يمكن المسح!  غير موجود";
  }
  let all = await notificationModel.deleteMany({ receivers: { $in: [id] } });

  if (!all) {
    return res.status(404).json({ message: err_1 });
  }

  res.status(200).json({ message: "Notification deleted successfully!" });
});

export {
  createNotification,
  deleteNotification,
  getAllNotification,
  clearNotification,
};
