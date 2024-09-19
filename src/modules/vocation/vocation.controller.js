import { vocationModel } from "../../../database/models/vocation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createVocation = catchAsync(async (req, res, next) => {

  const newComp = new vocationModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Vocation created successfully!",
    savedComp,
  });
});

const getAllVocation = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(vocationModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Vocation was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateVocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedVocation = await vocationModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedVocation) {
    return res.status(404).json({ message: "Vocation not found!" });
  }
  res.status(200).json({
    message: "Vocation updated successfully!",
    updatedVocation,
  });
});
const deleteVocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteVocation = await vocationModel.findByIdAndDelete(id);
  if (!deleteVocation) {
    return res.status(404).json({ message: "Vocation not found!" });
  }
  res.status(200).json({
    message: "Vocation Deleted successfully!",
    deleteVocation,
  });
});

export { createVocation, getAllVocation, updateVocation, deleteVocation };
