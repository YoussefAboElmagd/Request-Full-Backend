import { complaintModel } from "../../../database/models/complaint.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createComplaint = catchAsync(async (req, res, next) => {
  const newComp = new complaintModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Complaint created successfully!",
    savedComp,
  });
});

const getAllComplaint = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(complaintModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Complaint was found!",
    });
  }
  res.json({
    message: "done",
    results,
  });

});
const getAllComplaintByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(complaintModel.find({user:req.params.id}), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Complaint was found!",
    });
  }
  res.json({
    message: "done",
    results,
  });

});

export { createComplaint, getAllComplaint,getAllComplaintByUser };
