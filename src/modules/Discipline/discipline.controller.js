import { disciplineModel } from "../../../database/models/discipline.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createDiscipline = catchAsync(async (req, res, next) => {
  const newData = new disciplineModel(req.body);
  const savedData = await newData.save();

  res.status(201).json({
    message: "Discipline created successfully!",
    savedData,
  });
});

const getAllDiscipline = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(disciplineModel.find(), req.query).search();
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
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

const updateDiscipline = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  const updatedDiscipline = await disciplineModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );
  if (!updatedDiscipline) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Discipline updated successfully!",
    updatedDiscipline,
  });
});
const deleteDiscipline = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  const deleteDiscipline = await disciplineModel.deleteDiscipline({_id:id});
  if (!deleteDiscipline) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Discipline Deleted successfully!",
    deleteDiscipline,
  });
});

export {
  createDiscipline,
  getAllDiscipline,
  updateDiscipline,
  deleteDiscipline,
};
