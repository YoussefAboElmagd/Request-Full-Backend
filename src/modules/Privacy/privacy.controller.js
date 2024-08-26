import { privacyModel } from "../../../database/models/privacy.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createPrivacy = catchAsync(async (req, res, next) => {
  req.body.model = "66ba0147b64cba13bd4fec37";

  const newPrivacy = new privacyModel(req.body);
  const savedPrivacy = await newPrivacy.save();

  res.status(201).json({
    message: "Privacy created successfully!",
    savedPrivacy,
  });
});
const updatePrivacy = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedPrivacy = await privacyModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedPrivacy) {
    return res.status(404).json({ message: "Privacy not found!" });
  }
  res.status(200).json({
    message: "Privacy updated successfully!",
    updatedPrivacy,
  });
});
const deletePrivacy = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletePrivacy = await privacyModel.findByIdAndDelete(id);
  if (!deletePrivacy) {
    return res.status(404).json({ message: "Privacy not found!" });
  }
  res.status(200).json({
    message: "Privacy Deleted successfully!",
    deletePrivacy,
  });
});

const getAllPrivacy = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(privacyModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Privacy laint was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

export { createPrivacy, updatePrivacy, getAllPrivacy, deletePrivacy };
