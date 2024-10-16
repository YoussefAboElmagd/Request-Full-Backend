import { groupChatModel } from "../../../database/models/groupChat.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createGroupChat = catchAsync(async (req, res, next) => {
  const newData = new groupChatModel(req.body);
  const savedData = await newData;
  savedData.users.push(savedData.createdBy);
  savedData.users = savedData.users.filter(
    (item, index) => savedData.users.indexOf(item) === index
  );
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
};
