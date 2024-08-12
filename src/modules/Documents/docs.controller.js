import { documentsModel } from "../../../database/models/documents.model.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import path from "path";
import fsExtra from "fs-extra";
import ApiFeature from "../../utils/apiFeature.js";

const createDocsComment = catchAsync(async (req, res, next) => {
  let document = "";
  req.body.document =
    req.files.document &&
    req.files.document.map(
      (file) =>
        `http://localhost:8000/documents/${file.filename.split(" ").join("_")}`
    );

  const directoryPath = path.join(document, "uploads/documents");

  fsExtra.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }
    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file.replace(/\s+/g, "_"));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.document) {
    document = req.body.document;
    document=document[0]

  }
  req.body.model = "66ba00e94554c396c5dd3e47";

let { comment ,project ,status,uploadedBy} = req.body
  // const newDocs = new documentsModel({comment,project,status,uploadedBy, document});
  // const savedDocs = await newDocs.save();
  const savedDocs = await documentsModel.insertMany({comment,project,status,uploadedBy, document});
  res.status(201).json({
    message: "Docs created successfully!",
    savedDocs
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
    message: "done",
    page: ApiFeat.page,
    count: await messageModel.countDocuments({ project: req.params.id }),
    results,
  });
});


const updateDocs = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let document = "";
  if (req.files.document) {
    req.body.document =
      req.files.document &&
      req.files.document.map(
        (file) =>
          `http://localhost:8000/documents/${file.filename.split(" ").join("")}`
      );

    const directoryPathh = path.join(document, "uploads/documents");

    fsExtra.readdir(directoryPathh, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPathh, file);
        const newPath = path.join(directoryPathh, file.replace(/\s+/g, ""));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

  }
  if (req.body.document !== undefined) {    
    document = req.body.document;
    document=document[0]
   
  }
  let updateDocs = await documentsModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );
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
export { updateDocs, createDocsComment ,getAllDocsByProject,deleteDocs };
