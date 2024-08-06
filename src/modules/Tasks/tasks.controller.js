import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";

const createTask = catchAsync(async (req, res, next) => {
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }
  req.body.users = [];
  let newTask = new taskModel(req.body);
  let addedTask = await newTask.save();

  res.status(201).json({
    message: " Task has been created successfully!",
    addedTask,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find().populate("users"), req.query)

    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    let filter = await taskModel.find({
      $and: [
        { taskType: filterType.toLowerCase() },
        { eDate: filterValue },
      ]
    })
    results = filter  
  }

  res.json({
    message: "done",
    // count: await taskModel.countDocuments(),
    results,
  });

});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ createdBy: req.params.id }).populate("users"),
    req.query
  )
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    let filter = await taskModel.find({
      $and: [
        { taskType: filterType.toLowerCase() },
        { eDate: filterValue },
      ]
    })
    results = filter  
  }

  res.json({
    message: "done",
    results,
  });

});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await taskModel.findById(id).populate("users").populate("createdBy");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "done",
    results,
  });});

const updateTaskPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let documments = "";
  if (req.files.documments) {
    req.body.documments =
      req.files.documments &&
      req.files.documments.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
      );
    const directoryPathh = path.join(documments, "uploads/tasks");

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
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documments: docummentss } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!",  documments, resources });
});


const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let updatedTask = await taskModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskModel.findByIdAndDelete({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
});



export {
  createTask,
  getAllTaskByAdmin,
  getTaskById,
  deleteTask,
  getAllTaskByUser,
  updateTaskPhoto,
  updateTask,
};
