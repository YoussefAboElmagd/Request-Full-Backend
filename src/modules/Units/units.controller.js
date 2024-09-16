import { unitsModel } from "../../../database/models/units.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createUnits = catchAsync(async (req, res, next) => {

  const newComp = new unitsModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Units created successfully!",
    savedComp,
  });
});

const getAllUnits = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(unitsModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Units was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateUnits = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUnits = await unitsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedUnits) {
    return res.status(404).json({ message: "Units not found!" });
  }
  res.status(200).json({
    message: "Units updated successfully!",
    updatedUnits,
  });
});
const deleteUnits = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteUnits = await unitsModel.findByIdAndDelete(id);
  if (!deleteUnits) {
    return res.status(404).json({ message: "Units not found!" });
  }
  res.status(200).json({
    message: "Units Deleted successfully!",
    deleteUnits,
  });
});

export {createUnits, getAllUnits, updateUnits, deleteUnits };
