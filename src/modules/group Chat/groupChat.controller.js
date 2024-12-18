import { groupChatModel } from "../../../database/models/groupChat.js";
import { projectModel } from "../../../database/models/project.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createGroupChat = catchAsync(async (req, res, next) => {
  const newData = new groupChatModel(req.body);
  newData.users.push(newData.createdBy);
  newData.users = newData.users.filter(
    (item, index) => newData.users.indexOf(item) === index
  );
  const savedData = await newData.save();
  res.status(201).json({
    message: "GroupChat created successfully!",
    savedData,
  });
});

const getAllGroupChat = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(groupChatModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No GroupChat was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getGroupChatById = catchAsync(async (req, res, next) => {
  let err_1 = "No GroupChat was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مجموعة";
  }
  let ApiFeat = new ApiFeature(
    groupChatModel.findById(req.params.id),
    req.query
  ).search();
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
    results,
  });
});
const getUsersToAdd = catchAsync(async (req, res, next) => {
  let err_1 = "No GroupChat was found!";
  let err_2 = "No Project  was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مجموعة";
    err_2 = "لا يوجد مشروع";
  }
  let members = await projectModel
    .findById(req.params.projectId)
    .select("members");

  if (!members) {
    return res.status(404).json({
      message: err_2,
    });
  }
  members = members.members;
  let ApiFeat = new ApiFeature(
    groupChatModel.findById(req.params.id).select("users"),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  let resultIds = results.users.map((user) => user._id.toString());

  results = members.filter(
    (member) => !resultIds.includes(member._id.toString())
  );
  res.json({
    message: "Done",
    results,
  });
});
const getAllChatsForUserByproject = catchAsync(async (req, res, next) => {
  let project = await projectModel.findById(req.params.id).populate("members");
  if (!project) {
    return res.status(404).json({
      message: "Project not found!",
    });
  }
  project = project.members;
  let ApiFeat = new ApiFeature(
    groupChatModel.find({
      $and: [{ users: { $in: req.user._id } }, { project: req.params.id }],
    }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  results = results.concat(project);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No GroupChat was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateGroupChat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { users, name, project, createdBy } = req.body;
  const updatedGroupChat = await groupChatModel.findByIdAndUpdate(
    id,
    {
      $push: {
        users,
      },
      name,
      project,
      createdBy,
    },
    {
      new: true,
    }
  );
  if (!updatedGroupChat) {
    return res.status(404).json({ message: "GroupChat not found!" });
  }
  res.status(200).json({
    message: "GroupChat updated successfully!",
    updatedGroupChat,
  });
});
const updateGroupChat2 = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { users } = req.body;
  const updatedGroupChat = await groupChatModel.findByIdAndUpdate(
    id,
    {
      $pull: {
        users,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedGroupChat) {
    return res.status(404).json({ message: "GroupChat not found!" });
  }
  res.status(200).json({
    message: "GroupChat updated successfully!",
    updatedGroupChat,
  });
});
const deleteGroupChat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteGroupChat = await groupChatModel.findByIdAndDelete(id);
  if (!deleteGroupChat) {
    return res.status(404).json({ message: "GroupChat not found!" });
  }
  res.status(200).json({
    message: "GroupChat Deleted successfully!",
    deleteGroupChat,
  });
});

export {
  createGroupChat,
  getAllGroupChat,
  updateGroupChat,
  deleteGroupChat,
  updateGroupChat2,
  getAllChatsForUserByproject,
  getGroupChatById,
  getUsersToAdd,
};
