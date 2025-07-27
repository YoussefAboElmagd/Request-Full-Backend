import { documentsModel } from "../../../database/models/documents.model.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import ApiFeature from "../../utils/apiFeature.js";
import { taskModel } from "../../../database/models/tasks.model.js";
import { photoUpload } from "../../utils/removeFiles.js";

const createDocs = catchAsync(async (req, res, next) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "File is required." });
  }

  const { task, uploadedBy } = req.body;

  // Validate required fields
  if (!task || !uploadedBy) {
    return res
      .status(400)
      .json({ message: "Task and uploadedBy are required." });
  }

  // Ensure the task exists
  const taskFound = await taskModel.findById(task);
  if (!taskFound) {
    return res.status(404).json({ message: "Task not found." });
  }

  // Normalize the file path for consistency

  // Save document info to DB
  const doc = await documentsModel.create({
    path: `/documents/${req.file.filename}`,
    task,
    uploadedBy,
  });

  // Optionally, generate a URL to access the uploaded file

  res.status(201).json({
    message: "Document uploaded successfully.",
    document: {
      id: doc._id,
      filename: doc.filename,
    },
  });
});

const getAllDocsByTask = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد بيانات";
  }
  let ApiFeat = new ApiFeature(
    taskModel.find({ _id: req.params.id }),
    req.query
  );
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  results = results[0].documents;
  res.json({
    message: "Done",
    results,
  });
});

const updateDocs = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_1 = "Couldn't update!  not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يمكن التحديث!  غير موجود";
  }
  let updateDocs = await documentsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updateDocs) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({ message: "Docs updated successfully!", updateDocs });
});

const deleteDocs = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "Couldn't Delete!  not found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يمكن المسح!  غير موجود";
  }
  const deleteDocss = await documentsModel.deleteOne({ _id: id });

  if (deleteDocss.deletedCount === 0) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({
    message: "Docs Deleted successfully!",
  });
});
export { updateDocs, createDocs, deleteDocs, getAllDocsByTask };
