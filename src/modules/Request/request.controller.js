import { requsetModel } from "../../../database/models/request.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createRequest = catchAsync(async (req, res, next) => {
  req.body.model = "66ba010fecc8dae4bda821c9";

  const newComp = new requsetModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Request created successfully!",
    savedComp,
  });
});

const getAllRequest = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(requsetModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Request was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllRequestByUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await requsetModel.find({ createdBy: id });
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "Done", results });
});
const updateRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedRequest = await requsetModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedRequest) {
    return res.status(404).json({ message: "Request not found!" });
  }
  res.status(200).json({
    message: "Request updated successfully!",
    updatedRequest,
  });
});
const deleteRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteRequest = await requsetModel.findByIdAndDelete(id);
  if (!deleteRequest) {
    return res.status(404).json({ message: "Request not found!" });
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
};
