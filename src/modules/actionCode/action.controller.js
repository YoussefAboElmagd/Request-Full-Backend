import { actionCodeModel } from "../../../database/models/actionCode.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createAction = catchAsync(async (req, res, next) => {
  const newComp = new actionCodeModel(req.body);
  const savedData = await newComp.save();

  res.status(201).json({
    message: "Action created successfully!",
    savedData,
  });
});

const getAllAction = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(actionCodeModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Action was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateAction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedAction = await actionCodeModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedAction) {
    return res.status(404).json({ message: "Action not found!" });
  }
  res.status(200).json({
    message: "Action updated successfully!",
    updatedAction,
  });
});
const deleteAction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteAction = await actionCodeModel.findByIdAndDelete(id);
  if (!deleteAction) {
    return res.status(404).json({ message: "Action not found!" });
  }
  res.status(200).json({
    message: "Action Deleted successfully!",
    deleteAction,
  });
});

export { createAction, getAllAction, updateAction, deleteAction };
