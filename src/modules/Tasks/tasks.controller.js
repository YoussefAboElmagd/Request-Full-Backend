import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { projectModel } from "../../../database/models/project.model.js";
import AppError from "../../utils/appError.js";
import mongoose from "mongoose";
import cron from "node-cron";
import moment from "moment";

const createTask = catchAsync(async (req, res, next) => {
  let tasks = Array.isArray(req.body) ? req.body : [req.body];
  tasks = tasks.map((task) => ({
    ...task,
    model: "66ba018d87b5d43dcd881f7e",
  }));

  for (const task of tasks) {
    if (task.parentTask) {
      const getAllSubTasks = await mongoose
        .model("task")
        .find({ parentTask: task.parentTask });
      const parentTask = await mongoose.model("task").findById(task.parentTask);
      if (!parentTask) {
        return next(new AppError("Parent task not found", 404));
      }

      let totalInvoicedQuantity = task.invoicedQuantity || 0;
      let totalExecutedQuantity = task.executedQuantity || 0;
      let totalApprovedQuantity = task.approvedQuantity || 0;
      let totalRequiredQuantity = task.requiredQuantity || 0;

      getAllSubTasks.forEach((subTask) => {
        totalInvoicedQuantity += subTask.invoicedQuantity || 0;
        totalExecutedQuantity += subTask.executedQuantity || 0;
        totalApprovedQuantity += subTask.approvedQuantity || 0;
        totalRequiredQuantity += subTask.requiredQuantity || 0;
      });

      if (parentTask.requiredQuantity < totalRequiredQuantity) {
        return next(
          new AppError(
            "Required quantity can't be greater than total required quantity",
            400
          )
        );
      }
      if (parentTask.invoicedQuantity < totalInvoicedQuantity) {
        return next(
          new AppError(
            "Invoiced quantity can't be greater than total invoiced quantity",
            400
          )
        );
      }
      if (parentTask.executedQuantity < totalExecutedQuantity) {
        return next(
          new AppError(
            "Executed quantity can't be greater than total executed quantity",
            400
          )
        );
      }
      if (parentTask.approvedQuantity < totalApprovedQuantity) {
        return next(
          new AppError(
            "Approved quantity can't be greater than total approved quantity",
            400
          )
        );
      }
    }
  }

  let addedTasks = await taskModel.insertMany(tasks);
  let taskIds = addedTasks.map((task) => task._id);
  await projectModel.findByIdAndUpdate(
    addedTasks[0].project,
    { $push: { tasks: { $each: taskIds } } },
    { new: true }
  );
  res.status(201).json({
    message: "Task(s) have been created successfully!",
    addedTasks,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find().populate("project").sort({ $natural: -1 }),
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
        return item.taskStatus
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "project") {
        return item.project.name
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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
    taskModel
      .find({
        $or: [{ assignees: req.params.id }, { createdBy: req.params.id }],
      })
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
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "taskStatus") {
        return item.taskStatus
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "project") {
        return item.project.name
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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
  let ApiFeat = null;
  if (req.query.status == "all") {
    ApiFeat = new ApiFeature(
      taskModel.find({ project: req.params.id }).populate({
        path: "assignees",
        select: "_id profilePic name",
      }),
      req.query
    )
      .sort()
      .search();
  } else {
    ApiFeat = new ApiFeature(
      taskModel
        .find({
          $and: [{ project: req.params.id }, { taskStatus: req.query.status }],
        })
        .populate({
          path: "assignees",
          select: "_id profilePic name",
        }),
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
        return item.taskStatus
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "taskPriority") {
        return item.taskPriority
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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
  let results = await taskModel
    .findById(req.params.id)
    .select("assignees")
    .populate("assignees");
  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "Done",
    results,
  });
});
const scheduleRecurringTasks = catchAsync(async (req, res, next) => {
  let check = await projectModel.findById(req.params.projectId);
  let check2 = await taskModel.findById(req.params.id);
  if (!check || check2) {
    return res.status(404).json({ message: "Project not found!" });
  }

  cron.schedule("0 0 * * *", async () => {
    try {
      const tasks = await taskModel.find({
        $and: [
          { type: "recurring" },
          { project: req.params.projectId },
          { $or: [{ createdBy: req.params.id }, { assignees: req.params.id }] },
        ],
      });

      tasks.forEach(async (task) => {
        const now = new Date();
        const nextOccurrence = moment(task.createdAt)
          .add(task.recurrenceInterval, task.recurrenceUnit)
          .toDate();

        if (
          nextOccurrence <= now &&
          (!task.recurrenceEndDate || now < task.recurrenceEndDate)
        ) {
          const newTask = new taskModel({
            ...task.toObject(),
            createdAt: now,
            type: "recurring", // new instance is not recurring
          });
          await newTask.save();
        }
      });
    } catch (error) {
      console.error("Error creating recurring tasks:", error);
    }
  });
});
const getAllSubTasksByParentTask = catchAsync(async (req, res, next) => {
  let results = await taskModel.find({ parentTask: req.params.id }).populate({
    path: "assignees",
    select: "_id profilePic name",
  });
  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getAllParentTasks = catchAsync(async (req, res, next) => {
  let userId = new mongoose.Types.ObjectId(req.params.id);
  let projectId = new mongoose.Types.ObjectId(req.params.projectId);
  let results = await taskModel
    .find({
      $and: [
        { parentTask: null },
        { project: projectId },
        { $or: [{ createdBy: userId }, { assignees: userId }] },
      ],
    })
    .select("title _id");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "Done",
    results,
  });
});
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
      $push: { documents, assignees, notes },
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
      price,
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
  let { documents, assignees, notes } = req.body;
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,

    {
      $pull: { documents, assignees, notes },
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
  getAllSubTasksByParentTask,
  getAllParentTasks,
  scheduleRecurringTasks,
};
