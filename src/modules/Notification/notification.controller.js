import { notificationModel } from "../../../database/models/notification.model.js";
import { sio } from "../../../server.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllNotification = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await notificationModel.find({
    receiver: id,
  });
  res.json({ message: "Done", results });
});

const createNotification = catchAsync(async (req, res, next) => {
  const newNotif = new notificationModel(req.body);
  const savedNotif = await newNotif.save();
  let message = req.body.content;
  let title = req.body.title;
  sio.emit(`notification_${req.body.receiver}`, { message }, { title });

  res.status(201).json({
    message: "notification created successfully!",
    savedNotif,
  });
});

const deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedNotification = await notificationModel.findByIdAndDelete(id);

  if (!deletedNotification) {
    return res.status(404).json({ message: "notification not found!" });
  }

  res.status(200).json({ message: "notification deleted successfully!" });
});
const clearNotification = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let all = await notificationModel.deleteMany({ receiver: id });

  if (!all) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Notification deleted successfully!" });
});

export {
  createNotification,
  deleteNotification,
  getAllNotification,
  clearNotification,
};
