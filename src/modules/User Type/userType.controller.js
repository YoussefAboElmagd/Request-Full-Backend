import { userTypeModel } from "../../../database/models/userType.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createUserType = catchAsync(async (req, res, next) => {
  const newUserType = new userTypeModel(req.body);
  const savedUserType = await newUserType.save();

  res.status(201).json({
    message: "UserType created successfully!",
    savedUserType,
  });
});

const getAllUserType = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userTypeModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No UserType was found!",
    });
  }
  res.json({
    message: "done",
    results,
  });

});

const updateUserType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUserType = await userTypeModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );
  if (!updatedUserType) {
    return res.status(404).json({ message: "UserType not found!" });
  }
  res.status(200).json({
    message: "UserType updated successfully!",
    updatedUserType,
  });
});
const deleteUserType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteUserType = await userTypeModel.findByIdAndDelete(id);
  if (!deleteUserType) {
    return res.status(404).json({ message: "UserType not found!" });
  }
  res.status(200).json({
    message: "UserType Deleted successfully!",
    deleteUserType,
  });
});

export { createUserType, getAllUserType ,updateUserType,deleteUserType };
