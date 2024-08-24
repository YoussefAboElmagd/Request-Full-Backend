import generateUniqueId from "generate-unique-id";
import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";

const createTask = catchAsync(async (req, res, next) => {
  req.body.taskId = generateUniqueId({
    length: 9,
    useLetters: false,
  });
  req.body.model = "66ba018d87b5d43dcd881f7e"
  if (req.body.taskBudget && req.body.taskBudget >= 0) {
    let newTask = new taskModel(req.body);
    let addedTask = await newTask.save();

    res.status(201).json({
      message: " Task has been created successfully!",
      addedTask,
    });
  } else {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find().populate("project"), req.query)

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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "company") {
        if (item.company) {
          return item.company.name
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
      }
    });
  }

  res.json({
    message: "done",
    count: await taskModel.countDocuments(),
    results,
  });
});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({createdBy: req.params.id }).populate("project"),
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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "company") {
        if (item.company) {
          return item.company.name
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
      }
    });
  }

  res.json({
    message: "done",
    count: await taskModel.countDocuments({createdBy: req.params.id}),
    results,
  });
});
const getAllTaskByProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ project: req.params.id })
      .populate("project"),
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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "company") {
        if (item.company) {
          return item.company.name
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
      }
    });
  }

  res.json({
    message: "done",
    count: await taskModel.countDocuments({ project: req.params.id }),
    results,
  });
});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await taskModel
    .findById(id)
    .populate("createdBy")
    .populate("project");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "done",
    results,
  });
});

const updateTaskPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let documents = "";
  if (req.files.documents) {
    req.body.documents =
      req.files.documents &&
      req.files.documents.map(
        (file) =>
          `http://localhost:8000/tasks/${file.filename.split(" ").join("_")}`
      );
    const directoryPathh = path.join(documents, "uploads/tasks");

    fsExtra.readdir(directoryPathh, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPathh, file);
        const newPath = path.join(directoryPathh, file.replace(/\s+/g, "_"));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    if (req.body.documents !== "") {
      documents = req.body.documents;
    }
  }
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documents: documents } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res
    .status(200)
    .json({ message: "Task updated successfully!", documents, resources });
});

const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.taskBudget < 0) {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
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
  getAllTaskByProject
};
