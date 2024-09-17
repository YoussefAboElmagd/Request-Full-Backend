import { documentsModel } from "../../../database/models/documents.model.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import path from "path";
import fsExtra from "fs-extra";
import ApiFeature from "../../utils/apiFeature.js";
import { taskModel } from "../../../database/models/tasks.model.js";
import { projectModel } from "../../../database/models/project.model.js";

const createDocs = catchAsync(async (req, res, next) => {
  let document = "";
  req.body.document =
    req.files.document &&
    req.files.document.map(
      (file) =>
        `http://localhost:8000/documents/${file.filename.split(" ").join("-")}`
    );

  const directoryPath = path.join(document, "uploads/documents");

  fsExtra.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }
    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.document) {
    document = req.body.document;
    document = document[0];
  }
  req.body.model = "66ba00e94554c396c5dd3e47";

  let { comment, project, status, uploadedBy } = req.body;
  // const newDocs = new documentsModel({comment,project,status,uploadedBy, document});
  // const savedDocs = await newDocs.save();
  const savedDocs = await documentsModel.insertMany({
    comment,
    project,
    status,
    uploadedBy,
    document,
  });
  let addDocsToProject = await projectModel.findByIdAndUpdate(
    savedDocs.project,
    {
      $push: { documents: savedDocs._id },
    },
    { new: true }
  )
  res.status(201).json({
    message: "Docs created successfully!",
    savedDocs,
  });
});

const getAllDocsByProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    documentsModel.find({ project: req.params.id }),
    req.query
  );
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Docs was found!",
    });
  }
  res.json({
    message: "Done",
    page: ApiFeat.page,
    count: await documentsModel.countDocuments({ project: req.params.id }),
    results,
  });
});
const getAllDocsByTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ _id: req.params.id }),
    req.query
  );
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Docs was found!",
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

  let updateDocs = await documentsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updateDocs) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Docs updated successfully!", updateDocs });
});

const deleteDocs = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteDocs = await documentsModel.findByIdAndDelete(id);
  if (!deleteDocs) {
    return res.status(404).json({ message: "Docs not found!" });
  }
  res.status(200).json({
    message: "Docs Deleted successfully!",
    deleteDocs,
  });
});
export {
  updateDocs,
  createDocs,
  getAllDocsByProject,
  deleteDocs,
  getAllDocsByTask,
};
