import { projectModel } from "../../../database/models/project.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createProject = catchAsync(async (req, res, next) => {
  let newProject = new projectModel(req.body);
  let addedProject = await newProject.save();
  res.status(201).json({
    message: " Project has been created successfully!",
    addedProject,
  });
});
const updateProjectPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let documments = "";
  if (req.files.documments) {
    req.body.documments =
      req.files.documments &&
      req.files.documments.map(
        (file) =>
          `http://localhost:8000/documents/${file.filename.split(" ").join("")}`
      );

    const directoryPathh = path.join(documments, "uploads/documents");

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

    if (req.body.documments !== "") {
      documments = req.body.documments;
    }
  }
  let updatedTask = await projectModel.findByIdAndUpdate(
    id,
    { $push: { documments: documments } },
    { new: true }
  );
  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!",  documments,  });
});

const getProjectById = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(projectModel.findById(req.params.id).populate("contractor").populate("consultant").populate("owner"), req.query)
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
    message: "done",
    results,
  });
});
////////////////////////////////// admin \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const getAllProjectByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(projectModel.find().populate("contractor").populate("consultant").populate("owner"), req.query)
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
  let { filterType, filterValue } = req.query;
  if (filterType && filterValue) {
    let filter = await projectModel.find({
      $and: [
        { status: filterType.toLowerCase() },
        { eDate: filterValue },
      ]
    })
    results = filter  
  }

  res.json({
    message: "done",
    count: await projectModel.countDocuments(),
    results,
  });
});
const getAllProjectByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(projectModel.find().populate("contractor").populate("consultant").populate("owner"), req.query)
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
  let { filterType, filterValue } = req.query;
  if (filterType && filterValue) {
    let filter = await projectModel.find({
      $and: [
        { status: filterType.toLowerCase() },
        { eDate: filterValue },
      ]
    })
    results = filter  
  }

  res.json({
    message: "done",
    count: await projectModel.countDocuments(),
    results,
  });
});

////////////////////////////////// contractor \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////// consultant \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const updateProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedProject = await projectModel.findByIdAndUpdate(
    id,
req.body,    { new: true }
  );

  if (!updatedProject) {
    return res.status(404).json({ message: "Project not found!" });
  }
  res.status(200).json({
    message: "project updated successfully!",
    updatedProject,
  });
});

const deleteProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedProject = await projectModel.findByIdAndDelete(id);
  if (!deletedProject) {
    return res.status(404).json({ message: "Project not found!" });
  }
  res.status(200).json({ message: "project deleted successfully!" });
});


export {  deleteProject, updateProject, getAllProjectByAdmin ,createProject ,updateProjectPhoto ,getProjectById};
