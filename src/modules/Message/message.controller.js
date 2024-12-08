import { messageModel } from "../../../database/models/message.model.js";
import { sio } from "../../../server.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { userModel } from "../../../database/models/user.model.js";
import { photoUpload } from "../../utils/removeFiles.js";

const createmessage = catchAsync(async (req, res, next) => {
  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  let currentTime = new Date();
  let createdAt = formatAMPM(currentTime);
  req.body.date = createdAt;
  let content = req.body.content;
  let sender = req.body.sender;
  let receiver = req.body.receiver;
  let project = req.body.project;

  let senderName = await userModel.findById(sender).select("name");
  senderName = senderName.name;

  let docs = [];
  let voiceNote = [];
  if (req.body.docs) {
    docs = req.body.docs;
  }
  if (req.body.voiceNote) {
    voiceNote = req.body.voiceNote;
  }
  // req.body.model = "66ba00faf820163904164a43";

  const newmessage = new messageModel(req.body);
  const savedmessage = await newmessage.save();

  if (savedmessage.group !== null) {
    sio.emit(
      `message_${sender}_${project}_${req.body.group}`,
      { createdAt },
      { content },
      { sender },
      { senderName },
      { receiver },
      { project },
      { docs },
      { voiceNote }
    );
  } else {
    sio.emit(
      `message_${sender}_${receiver}_${project}`,
      { createdAt },
      { content },
      { sender },
      { senderName },
      { receiver },
      { project },
      { docs },
      { voiceNote }
    );
  }

  res.status(201).json({
    message: "message created successfully!",
    savedmessage,
  });
});
const addPhotos = catchAsync(async (req, res, next) => {
  let docs = photoUpload(req, "docs", "chat");
  let voiceNote = photoUpload(req, "voiceNote", "chat");
  docs = docs.replace(`https://api.request-sa.com/`, "");
  voiceNote = voiceNote.replace(`https://api.request-sa.com/`, "");
  res.status(200).json({
    message: "Photos created successfully!",
    docs,
    voiceNote,
  });
});

const getAllmessageByProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    messageModel.find({ project: req.params.id }),
    req.query
  );
  // .sort({ $natural: -1 })  for latest message
  // .pagination()

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
  res.json({
    message: "Done",
    // page: ApiFeat.page,
    // count: await messageModel.countDocuments({ taskId: req.params.id }),
    results,
  });
});

export { createmessage, addPhotos, getAllmessageByProject };
