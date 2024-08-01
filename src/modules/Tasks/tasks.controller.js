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
const getAllSubTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ parentTask: req.params.id }).populate("users").populate("createdBy"),
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
  res.json({
    message: "done",
    results,
  });
});
const getAllPeopleTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id).populate("users"),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    results : results.users,
  });
});
const getAllDocsTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id),
    req.query
  )
    .sort()
    .search();

    let results = await ApiFeat.mongooseQuery;

    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
      let documments = []
      if(results.documments){
        documments = results.documments
      }
    
  res.json({
    message: "done",
    documments,
  });
});
const getAllResTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id),
    req.query
  )
    .sort()
    .search();

  
    let results = await ApiFeat.mongooseQuery;

    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
      let resources = []
      if(results.resources){
        resources = results.resources
      }
    
  res.json({
    message: "done",
    resources
  });
});
const getAllTaskByUserShared = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskType: "shared" },
          { isShared: true },
          { parentTask: null },
        ],
      })
      .populate("users")
      .populate("createdBy"),
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
      if (filterType == "date") {
        return item.eDate == filterValue;
      }
    });
  }
  res.json({
    message: "done",
    results,
  });

});
const getAllTaskByUserNormal = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskType: "normal" },
          { isShared: false },
          { parentTask: null },
        ],
      })
      .populate("users").populate("createdBy"),
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
      if (filterType == "date") {
          return item.eDate == filterValue;
      }
    });
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
  let resources = "";
  let documments = "";
  if (req.files.documments || req.files.resources) {
    req.body.documments =
      req.files.documments &&
      req.files.documments.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
      );

    req.body.resources =
      req.files.resources &&
      req.files.resources.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
      );

    const directoryPath = path.join(resources, "uploads/tasks");

    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, ""));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });
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
    if (req.body.resources !== "") {
      resources = req.body.resources;
    }
  }
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documments: documments, resources: resources } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!",  documments, resources });
});

const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { isShared: true, taskType: "shared", $push: { users: req.body.users } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
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


// Admin
const getAllTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments(),
    });

});
const getCancelTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({taskStatus:"Cancelled"}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments({taskStatus:"Cancelled"}),
    });

});
const getInProgressTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({taskStatus:"InProgress"}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments({taskStatus:"InProgress"}),
    });

  });
    ///////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    
// User

    const getAllTasksByUser  = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel.find(
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
        ), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments( { $or: [{ createdBy: req.params.id }, { users: req.params.id }] }),
        });
    
    });
    const getCancelTasksByUser  = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel
        .find({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Cancelled"}
          ],
        }), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Cancelled"}
          ],
        }),
        });
    
    });
    const getInProgressTasksByUser = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel
        .find({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"InProgress"}
          ],
        }), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"InProgress"}
          ],
        }),
        });
    });


export {
  createTask,
  getAllTaskByAdmin,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTaskByUser,
  updateTaskPhoto,
  getAllTaskByUserShared,
  getAllTaskByUserNormal,
  getAllSubTaskByUser,
  updateTask2,
  getAllPeopleTask,
  getAllDocsTask,
  getAllResTask,
  getAllTasksByAdmin,
  getCancelTasksByAdmin,
  getInProgressTasksByAdmin,
  getAllTasksByUser,
  getCancelTasksByUser,
  getInProgressTasksByUser,
};
