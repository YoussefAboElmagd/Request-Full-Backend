import { projectModel } from "../../../database/models/project.model.js";
import { tagsModel } from "../../../database/models/tags.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createTags = catchAsync(async (req, res, next) => {
  req.body.model = "66e5570f78313d16a73caa9a";
  req.body.createdBy = req.params.id;
  const newData = new tagsModel(req.body);
  const savedData = await newData.save();

  res.status(201).json({
    message: "Tags created successfully!",
    savedData,
  });
});

const getAllTagsByAdmin = catchAsync(async (req, res, next) => {
  let err_1 = "No Tags was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد علامة"
  }
  let ApiFeat = new ApiFeature(tagsModel.find(), req.query).search();
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
const getAllTagsByUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_2 = "User not found!"
  if(req.query.lang == "ar"){
    err_2 = "المستخدم غير موجود"
  }
  let userResults = await userModel.findById(id);
  if (userResults) {
    let results = await tagsModel.find({ createdBy: id });
    results && res.json({ message: "Done", results });
  } else {
    res.json({ message: err_2 });
  }
});
const getAllTagsByProject = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_2 = "project not found!"
  if(req.query.lang == "ar"){
    err_2 = "المشروع غير موجود"
  }
  let results = await projectModel.findById(id);
  if (results) {
    let tags = await tagsModel.find({ createdBy: results.consultant._id });
    tags && res.json({ message: "Done", tags });
  } else {
    res.json({ message: err_2 });
  }
});

const updateTags = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Tags was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد علامة"
  }
  const updateeTags = await tagsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updateeTags) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Tag Updated successfully!",
    updateeTags,
  });
});
const deleteTags = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Tags was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد علامة"
  }
  const deleteTags = await tagsModel.deleteOne({ _id: id });
  if (!deleteTags) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Tags Deleted successfully!",
    deleteTags,
  });
});

export {
  createTags,
  getAllTagsByAdmin,
  getAllTagsByUser,
  getAllTagsByProject,
  updateTags,
  deleteTags,
};
