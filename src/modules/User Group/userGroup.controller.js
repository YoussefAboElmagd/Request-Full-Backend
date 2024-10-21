import { userGroupModel } from "../../../database/models/userGroups.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createUserGroup = catchAsync(async (req, res, next) => {
  const newData = new userGroupModel(req.body);
  const savedData = await newData;
  savedData.users.push(savedData.createdBy);
  savedData.users = savedData.users.filter(
    (item, index) => savedData.users.indexOf(item) === index
  );
  await savedData.save();
  res.status(201).json({
    message: "UserGroup created successfully!",
    savedData,
  });
});

const getAllUserGroup = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userGroupModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No UserGroup was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllUserGroupByCreatedBy = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userGroupModel.find({ createdBy: req.params.id }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No UserGroup was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateUserGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { users, tags, rights ,name } = req.body;
  const updatedUserGroup = await userGroupModel.findByIdAndUpdate(
    id,
    {
      $push: {
        users,
        tags,
        rights,
      },
      name
    },
    {
      new: true,
    }
  );
  if (!updatedUserGroup) {
    return res.status(404).json({ message: "UserGroup not found!" });
  }
  res.status(200).json({
    message: "UserGroup updated successfully!",
    updatedUserGroup,
  });
});
const updateUserGroup2 = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { users, tags, rights } = req.body;
  const updatedUserGroup = await userGroupModel.findByIdAndUpdate(
    id,
    {
      $pull: {
        users,
        tags,
        rights,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedUserGroup) {
    return res.status(404).json({ message: "UserGroup not found!" });
  }
  res.status(200).json({
    message: "UserGroup updated successfully!",
    updatedUserGroup,
  });
});
const deleteUserGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteUserGroup = await userGroupModel.findByIdAndDelete(id);
  if (!deleteUserGroup) {
    return res.status(404).json({ message: "UserGroup not found!" });
  }
  res.status(200).json({
    message: "UserGroup Deleted successfully!",
    deleteUserGroup,
  });
});

export {
  createUserGroup,
  getAllUserGroup,
  updateUserGroup,
  deleteUserGroup,
  updateUserGroup2,
  getAllUserGroupByCreatedBy,
};
