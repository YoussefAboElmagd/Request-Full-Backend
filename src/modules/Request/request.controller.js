import { projectModel } from "../../../database/models/project.model.js";
import { requsetModel } from "../../../database/models/request.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createRequest = catchAsync(async (req, res, next) => {
  req.body.model = "66ba010fecc8dae4bda821c9";
  const project = await projectModel.findById(req.body.project);
  let dueDate = new Date(project.dueDate).toISOString().split("T")[0];
  let sDate = new Date(project.sDate).toISOString().split("T")[0];
  let err_1 = "Project not found!"
  let err_date1 = `Due date of model must be less than or equal to ${dueDate} (due date of project) `
  let err_date2 = `Start date of model must be less than or equal to ${sDate} (Start date of project) `
  if(req.query.lang == "ar"){
    err_1 = "المشروع غير موجود"
    err_date1 = `تاريخ الانتهاء يجب ان يكون اقل من او يساوي ${dueDate} (تاريخ انتهاء المشروع) `
    err_date2 = `تاريخ البدء يجب ان يكون اقل من او يساوي ${sDate} (تاريخ بدء المشروع) `
  }

  if (!project) {
    return res.status(404).json({ message: err_1 });
  }

  if (new Date(req.body.date) > new Date(project.dueDate)) {
    return res
      .status(404)
      .json({
        message: err_date1,
      });
  }
  if (new Date(req.body.date) < new Date(project.sDate)) {
    return res
      .status(404)
      .json({
        message:err_date2,
      });
  }
  const newData = new requsetModel(req.body);
  const savedData = await newData.save();

  res.status(201).json({
    message: "Request created successfully!",
    savedData,
  });
});

const getAllRequest = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(requsetModel.find(), req.query).search();
  let err_1 = "No Model was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد نماذج"
  }
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
const getRequestById = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(requsetModel.findById(req.params.id), req.query).search();
  let err_1 = "No Model was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد نماذج"
  }
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
const getAllRequestByUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_2 = "User not found!"
  if(req.query.lang == "ar"){
    err_2 = "المستخدم غير موجود"
  }
  let results = await requsetModel.find({ createdBy: id });
  !results && next(new AppError(err_2, 404));
  results && res.json({ message: "Done", results });
});
const getAllRequestByProject = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_2 = "Project not found!"
  if(req.query.lang == "ar"){
    err_2 = "المشروع غير موجود"
  }
  let results = await requsetModel.find({ project: id });
  !results && next(new AppError(err_2, 404));
  results && res.json({ message: "Done", results });
});
const getAllRequestByTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_2 = "Task not found!"
  if(req.query.lang == "ar"){
    err_2 = "المهمة غير موجود"
  }
  let results = await requsetModel.find({ task: id });
  !results && next(new AppError(err_2, 404));
  results && res.json({ message: "Done", results });
});
const updateRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Model was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد نماذج"
  }
  const updatedRequest = await requsetModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedRequest) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Request updated successfully!",
    updatedRequest,
  });
});
const deleteRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Model was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد نماذج"
  }
  const deleteRequest = await requsetModel.deleteOne({_id:id});
  if (!deleteRequest) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Request Deleted successfully!",
    deleteRequest,
  });
});

export {
  createRequest,
  getAllRequest,
  updateRequest,
  deleteRequest,
  getAllRequestByUser,
  getAllRequestByProject,
  getAllRequestByTask,
  getRequestById,
};
