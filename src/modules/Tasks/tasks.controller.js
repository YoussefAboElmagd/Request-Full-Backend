import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { projectModel } from "../../../database/models/project.model.js";

const createTask = catchAsync(async (req, res, next) => {
  let tasks = Array.isArray(req.body) ? req.body : [req.body];

  tasks = tasks.map(task => ({
    ...task,
    assignees: task.createdBy,
    model: "66ba018d87b5d43dcd881f7e",
  }));

  let addedTasks = await taskModel.insertMany(tasks);

  let taskIds = addedTasks.map(task => task._id);
    await projectModel.findByIdAndUpdate(
    addedTasks[0].project, // Assumes all tasks belong to the same project
    { $push: { tasks: { $each: taskIds } } }, // Push all task IDs at once
    { new: true }
  );
    res.status(201).json({
      message: " Task has been created successfully!",
      addedTasks,
    });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find().populate("project").sort({ $natural: -1 }), req.query)
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
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskStatus") {
        return item.taskStatus.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "project") {
        return item.project.name.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  }

  res.json({
    message: "Done",
    count: await taskModel.countDocuments(),
    results,
  });
});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({$or:[{assignees: req.params.id},
      { createdBy: req.params.id} ]}
      ).populate("project"),
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
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskStatus") {
        return item.taskStatus.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "project") {
        return item.project.name.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  }

  res.json({
    message: "Done",
    count: await taskModel.countDocuments({ createdBy: req.params.id }),
    results,
  });
});
const getAllTaskByProject = catchAsync(async (req, res, next) => {
  let ApiFeat = null
  if (req.query.status == "all") {
    ApiFeat = new ApiFeature(
      taskModel.find({ project: req.params.id }).populate({
        path: 'assignees',
        select: '_id profilePic name'}),
      req.query
    )
      .sort()
      .search();
  } else {
    ApiFeat = new ApiFeature(
      taskModel.find({$and:[{ project: req.params.id }, {taskStatus: req.query.status}]}).populate({
        path: 'assignees',
        select: '_id profilePic name'}),
      req.query
    )
      .sort()
      .search();
  }
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
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskStatus") {
        return item.taskStatus.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  }

  res.json({
    message: "Done",
    count: await taskModel.countDocuments({ project: req.params.id }),
    results,
  });
});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await taskModel
    .findById(id)
    .populate("assignees")
    .populate("project")
    .populate("createdBy");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getAllAssigness = catchAsync(async (req, res, next) => {
  let results = await taskModel.findById(req.params.id).select("assignees").populate("assignees");
    if (!results) {
      return res.status(404).json({ message: "Task not found!" });
    }
    
    res.json({
      message: "Done",
      results,
    });

})
const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let {
    title,
    description,
    priority,
    startDate,
    endDate,
    createdBy,
    project,
    documents,
    assignees,
    notes,
    requestForInspectionForm,
    tableOfQuantities,
    approvalOfSchemes,
    workRequest,
    requestForApprovalOfMaterials,
    requestForDocumentSubmittalApproval,
    isAproved,
    taskPriority,
    taskStatus,
    total,
    invoicedQuantity,
    executedQuantity,
    approvedQuantity,
    requiredQuantity,
    unit,
    price,
  } = req.body;
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,

    {
      $push: { documents, assignees,notes },
      title,
      description,
      priority,
      startDate,
      endDate,
      createdBy,
      project,
      requestForInspectionForm,
      tableOfQuantities,
      approvalOfSchemes,
      workRequest,
      requestForApprovalOfMaterials,
      requestForDocumentSubmittalApproval,
      isAproved,
      taskPriority,
      taskStatus,
      total,
      invoicedQuantity,
      executedQuantity,
      approvedQuantity,
      requiredQuantity,
      unit,
      price
    },
    {
      new: true,
    }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let {
    documents,
    assignees,
    notes,
  } = req.body;
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,

    {
      $pull: { documents, assignees,notes },
    },
    {
      new: true,
    }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskModel.deleteOne({ _id: id });

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
  updateTask,
  updateTask2,
  getAllTaskByProject,
  getAllAssigness,
};
