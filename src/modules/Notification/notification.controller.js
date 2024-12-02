import { notificationModel } from "../../../database/models/notification.model.js";
import { sio } from "../../../server.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllNotification = catchAsync(async (req, res, next) => {
  let { id } = req.params; // User or receiver ID
  const DaysAgo = new Date();
  let day = Number(req.query.days) || 7; // Default to 7 days if no `days` query is provided
  DaysAgo.setDate(DaysAgo.getDate() - day);
  let results = await notificationModel
    .find({
      receivers: { $in: [id] }, // Check if the `id` exists in the `receivers` array
      createdAt: { $gte: DaysAgo }, // Notifications created within the specified time frame
    })
    .sort({ $natural: -1 }); // Sort results by natural order (most recent first)

  res.json({ message: "Done", results });
});

const createNotification = catchAsync(async (req, res, next) => {
  req.body.model = "66ba0122ff7376971c929636";

  const newNotif = new notificationModel(req.body);
  const savedNotif = await newNotif.save();
  let message = req.body.message;
  let title = req.body.title;

  if (!Array.isArray(req.body.receivers)) {
    req.body.receivers = [req.body.receivers];
  }
  let receivers = req.body.receivers;
  sio.emit(`notification_`, { message }, { title }, { receivers });

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
  let all = await notificationModel.deleteMany({ receiver: id });

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
