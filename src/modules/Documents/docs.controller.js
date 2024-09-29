import { documentsModel } from "../../../database/models/documents.model.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import ApiFeature from "../../utils/apiFeature.js";
import { taskModel } from "../../../database/models/tasks.model.js";
import { photoUpload } from "../../utils/removeFiles.js";

const createDocs = catchAsync(async (req, res, next) => {

  const document = photoUpload(req, "document", "documents");

  req.body.model = "66ba00e94554c396c5dd3e47";

  let { comment, task, status, uploadedBy } = req.body;
  // const newDocs = new documentsModel({comment,task,status,uploadedBy, document});
  // const savedDocs = await newDocs.save();
  const savedDocs = await documentsModel.insertMany({
    comment,
    task,
    status,
    uploadedBy,
    document,
  });
  savedDocs.forEach(async (doc) => {
    
  await taskModel.findByIdAndUpdate(
    doc.task,
    {
      $push: { documents: doc._id },
    },
    { new: true }
  )
})
  
  res.status(201).json({
    message: "Docs created successfully!",
    savedDocs,
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
  deleteDocs,
  getAllDocsByTask,
};
