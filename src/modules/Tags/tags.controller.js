import { tagsModel } from "../../../database/models/tags.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createTags = catchAsync(async (req, res, next) => {
  const newTags = new tagsModel(req.body);
  const savedTags = await newTags.save();

  res.status(201).json({
    message: "Tags created successfully!",
    savedTags,
  });
});

const getAllTagsByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(tagsModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Tags was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getTagByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    tagsModel.find({ user: req.params.id }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Tags was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateTags = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedTags = await tagsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedTags) {
    return res.status(404).json({ message: "Tags not found!" });
  }
  res.status(200).json({
    message: "Tags updated successfully!",
    updatedTags,
  });
});
const deleteTags = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteTags = await tagsModel.findByIdAndDelete(id);
  if (!deleteTags) {
    return res.status(404).json({ message: "Tags not found!" });
  }
  res.status(200).json({
    message: "Tags Deleted successfully!",
    deleteTags,
  });
});

export { createTags, getAllTagsByAdmin, getTagByUser, updateTags, deleteTags };
