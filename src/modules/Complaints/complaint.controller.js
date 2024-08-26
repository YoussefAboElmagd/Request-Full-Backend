import { complaintModel } from "../../../database/models/complaint.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createComplaint = catchAsync(async (req, res, next) => {
  req.body.model = "66ba00c7c54b444982177b57";

  const newComp = new complaintModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Complaint created successfully!",
    savedComp,
  });
});

const getAllComplaintByAdmin = catchAsync(async (req, res, next) => {
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
    message: "Done",
    results,
  });
});
const getAllComplaintByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    complaintModel.find({ user: req.params.id }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Complaint was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const deleteComplaint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteComplaint = await complaintModel.findByIdAndDelete(id);
  if (!deleteComplaint) {
    return res.status(404).json({ message: "Complaint not found!" });
  }
  res.status(200).json({
    message: "Complaint Deleted successfully!",
    deleteComplaint,
  });
});

export {
  createComplaint,
  getAllComplaintByAdmin,
  getAllComplaintByUser,
  deleteComplaint,
};
