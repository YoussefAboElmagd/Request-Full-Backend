import { projectLogModel } from "../../../database/models/projectLog.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createProjectLog = catchAsync(async (req, res, next) => {
  req.body.model = "66ba017594aef366c6a8def1";

  let newProjectLog = new projectLogModel(req.body);
  let addedProjectLog = await newProjectLog.save();
  res.status(201).json({
    message: " ProjectLog has been created successfully!",
    addedProjectLog,
  });
});

const getAllProjectLogByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectLogModel
      .find()
      .populate("contractor")
      .populate("consultant")
      .populate("owner"),
    req.query
  )
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Project was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const deleteProjectLog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedProjectLog = await projectLogModel.findByIdAndDelete(id);
  if (!deletedProjectLog) {
    return res.status(404).json({ message: "ProjectLog not found!" });
  }
  res.status(200).json({ message: "ProjectLog deleted successfully!" });
});

export { deleteProjectLog, createProjectLog };
