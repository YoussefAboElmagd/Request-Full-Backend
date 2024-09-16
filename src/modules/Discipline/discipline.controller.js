import { disciplineModel } from "../../../database/models/discipline.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createDiscipline = catchAsync(async (req, res, next) => {

  const newComp = new disciplineModel(req.body);
  const savedComp = await newComp.save();

  res.status(201).json({
    message: "Discipline created successfully!",
    savedComp,
  });
});

const getAllDiscipline = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(disciplineModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Discipline was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateDiscipline = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedDiscipline = await disciplineModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedDiscipline) {
    return res.status(404).json({ message: "Discipline not found!" });
  }
  res.status(200).json({
    message: "Discipline updated successfully!",
    updatedDiscipline,
  });
});
const deleteDiscipline = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteDiscipline = await disciplineModel.findByIdAndDelete(id);
  if (!deleteDiscipline) {
    return res.status(404).json({ message: "Discipline not found!" });
  }
  res.status(200).json({
    message: "Discipline Deleted successfully!",
    deleteDiscipline,
  });
});

export { createDiscipline, getAllDiscipline, updateDiscipline, deleteDiscipline };
