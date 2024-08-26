import { modelModel } from "../../../database/models/models.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createModel = catchAsync(async (req, res, next) => {
  const newModel = new modelModel(req.body);
  const savedModel = await newModel.save();

  res.status(201).json({
    message: "Model created successfully!",
    savedModel,
  });
});

const getAllModel = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(modelModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Model was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateModel = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedModel = await modelModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedModel) {
    return res.status(404).json({ message: "Model not found!" });
  }
  res.status(200).json({
    message: "Model updated successfully!",
    updatedModel,
  });
});
const deleteModel = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteModel = await modelModel.findByIdAndDelete(id);
  if (!deleteModel) {
    return res.status(404).json({ message: "Model not found!" });
  }
  res.status(200).json({
    message: "Model Deleted successfully!",
    deleteModel,
  });
});

export { createModel, getAllModel, updateModel, deleteModel };
