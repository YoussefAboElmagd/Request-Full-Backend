import { messageModel } from "../../../database/models/message.model.js";
import { sio } from "../../../server.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { userModel } from "../../../database/models/user.model.js";
import { photoUpload } from "../../utils/removeFiles.js";
import { projectModel } from "../../../database/models/project.model.js";
import { groupChatModel } from "../../../database/models/groupChat.js";
import AppError from "../../utils/appError.js";

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
  let type = req.body.type;

  let user = await userModel.findById(sender).select("name");
  let senderName = user.name;
  let profilePic = user.profilePic;

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
  let id = savedmessage._id;
  if (savedmessage.group !== null) {
    sio.emit(`message_${sender}_${project}_${req.body.group}`, {
      createdAt,
      content,
      type,
      sender,
      profilePic,
      senderName,
      receiver,
      docs,
      voiceNote,
      id,
    });
  } else {
    sio.emit(`message_${sender}_${project}_${receiver}`, {
      createdAt,
      content,
      type,
      sender,
      profilePic,
      senderName,
      docs,
      voiceNote,
      id,
    });
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

const getAllMessageByTwoUsers = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!";
  let err_2 = "sender or receiver not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد بيانات";
    err_2 = "المرسل او المستلم غير موجود";
  }
  if (!req.query.sender || !req.query.receiver) {
    return res.status(404).json({
      message: err_2,
    });
  }
  const { page = 1, limit = 20 } = req.query; // Pagination params with defaults

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  let ApiFeat = new ApiFeature(
    messageModel
      .find({
        $and: [
          { project: req.params.id },
          { group: null },
          {
            $or: [
              { sender: req.query.sender, receiver: req.query.receiver },
              { sender: req.query.receiver, receiver: req.query.sender },
            ],
          },
        ],
      })
      .sort({ $natural: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    req.query
  );
  // .pagination()
  const totalMessages = await messageModel.countDocuments({
    $and: [
      { project: req.params.id },
      { group: null },
      {
        $or: [
          { sender: req.query.sender, receiver: req.query.receiver },
          { sender: req.query.receiver, receiver: req.query.sender },
        ],
      },
    ],
  });

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  res.json({
    message: "Done",
    page: pageNumber,
    results,
    totalMessages,
  });
});
const getAllMessageByGroup = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!";
  let err_2 = "group not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد بيانات";
    err_2 = "المجموعة غير موجودة";
  }
  if (!req.query.group) {
    return res.status(404).json({
      message: err_2,
    });
  }
  const { page = 1, limit = 20 } = req.query; // Pagination params with defaults

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  let ApiFeat = new ApiFeature(
    messageModel
      .find({ $and: [{ project: req.params.id }, { group: req.query.group }] })
      .sort({ $natural: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize).populate("sender", "profilePic name"),
    req.query
  );

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  const totalMessages = await messageModel.countDocuments({
    $and: [{ project: req.params.id }, { group: req.query.group }],
  });
  res.json({
    message: "Done",
    page: pageNumber,
    results,
    totalMessages,
  });
});

const getAllGroupsByUserProjects = catchAsync(async (req, res, next) => {
  let err_1 = "No groups were found!";
  let err_2 = "User not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مجموعات";
    err_2 = "المستخدم غير موجود";
  }

  // Check if user exists
  const user = await userModel.findById(req.params.id);
  if (!user) return next(new AppError(err_2, 404));

  // Find all projects the user is a member of
  const projects = await projectModel
    .find({ members: { $in: req.params.id } })
    .select("_id name members") // Fetch project ID, name, and members
    .populate("members", "name email"); // Populate project members' details

  if (!projects.length) {
    return res.status(404).json({
      message: err_1,
    });
  }

  // Extract project IDs
  const projectIds = projects.map((project) => project._id);

  // Find all group chats linked to these projects
  const groupChats = await groupChatModel
    .find({
      $and: [
        { users: { $in: req.user._id } },
        { project: { $in: projectIds } },
      ],
    })
    .populate("users", "name email"); // Populate user details in the chat group

  if (!groupChats.length) {
    return res.status(404).json({
      message: err_1,
    });
  }

  // Combine project members and group chat users into one list
  const results = projects.map((project) => {
    const relatedGroupChats = groupChats.filter(
      (groupChat) => groupChat.project.toString() === project._id.toString()
    );

    const combinedUsers = [...project.members, ...relatedGroupChats];

    return {
      ...project.toObject(), // Convert project to plain object
      combinedList: combinedUsers, // Unified list of members and group chat users
    };
  });

  // Respond with the combined results
  res.json({
    message: "Done",
    results,
  });
});

export {
  createmessage,
  addPhotos,
  getAllMessageByTwoUsers,
  getAllGroupsByUserProjects,
  getAllMessageByGroup,
};
