import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { projectModel } from "../../../database/models/project.model.js";
import AppError from "../../utils/appError.js";
import mongoose from "mongoose";
import cron from "node-cron";
import moment from "moment";
import { userModel } from "../../../database/models/user.model.js";
import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import { removeFiles } from "../../utils/removeFiles.js";
import { sendNotification } from "../../utils/sendNotification.js";

const createTask = catchAsync(async (req, res, next) => {
  let tasks = Array.isArray(req.body) ? req.body : [req.body];
  let err_1 = "Project not found!";
  let err_2 = "Parent task not found";
  let err_3 = "User not found";
  let err_date_1 = "Start date must be less than or equal to due date";

  let err_valid_1 =
    "Required quantity can't be greater than total required quantity";
  let err_valid_2 =
    "Invoiced quantity can't be greater than total invoiced quantity";
  let err_valid_3 =
    "Executed quantity can't be greater than total executed quantity";
  let err_valid_4 =
    "Approved quantity can't be greater than total approved quantity";
  if (req.query.lang == "ar") {
    err_1 = "المشروع غير موجود";
    err_2 = "المهمة الأساسية غير موجودة";
    err_3 = "المستخدم غير موجود";
    err_date_1 = "تاريخ البدء يجب ان يكون اقل من او يساوي تاريخ الانتهاء";

    err_valid_1 =
      "الكمية المطلوبة يجب ان تكون اقل من او يساوي مجموع الكمية المصنعة";
    err_valid_2 =
      "الكمية المفوترة يجب ان تكون اقل من او يساوي مجموع الكمية المفوترة";
    err_valid_3 =
      "الكمية المنفذة يجب ان تكون اقل من او يساوي مجموع الكمية المنفذة";
    err_valid_4 =
      "الكمية المعتمدة يجب ان تكون اقل من او يساوي مجموع الكمية المعتمدة";
  }
  tasks = tasks.map((task) => ({
    ...task,
    model: "66ba018d87b5d43dcd881f7e",
  }));
  let user = null;
  for (const task of tasks) {
    const project = await projectModel.findById(task.project);
    user = await userModel.findById(task.createdBy);
    if (!user) {
      return res.status(404).json({ message: err_3 });
    }
    if (!project) {
      return res.status(404).json({ message: err_1 });
    }
    let message_en = ` New Task has been created on Project \' ${project.name} '\ !`;
    let message_ar = ` تم انشاء مهمة جديدة في المشروع \' ${project.name} '\ !`;

    let receivers = [
      project.owner?._id,
      project.contractor?._id,
      project.consultant?._id,
      ...(Array.isArray(task.assignees) ? task.assignees : [task.assignees]), // Flatten task.assignees
    ];
    sendNotification(message_en, message_ar, "success", receivers);
    let dueDate = new Date(project.dueDate).toISOString().split("T")[0];
    let sDate = new Date(project.sDate).toISOString().split("T")[0];
    let err_date_2 = `Due date of task must be less than or equal to ${dueDate} (due date of project) `;
    let err_date_3 = `Start date of task must be less than or equal to ${sDate} (Start date of project) `;
    let err_date_4 = `Start date of task must be less than or equal to ${dueDate} ( End date of project) `;
    if (req.query.lang == "ar") {
      err_date_2 = `تاريخ الانتهاء يجب ان يكون اقل من او يساوي ${dueDate} (تاريخ انتهاء المشروع) `;
      err_date_3 = `تاريخ البدء يجب ان يكون اقل من او يساوي ${sDate} (تاريخ بدء المشروع) `;
      err_date_4 = `تاريخ البدء يجب ان يكون اقل من او يساوي ${dueDate} (تاريخ انتهاء المشروع) `;
    }
    if (task.sDate && task.dueDate) {
      if (new Date(task.sDate) > new Date(task.dueDate)) {
        return res.status(404).json({ message: err_date_1 });
      }
      if (new Date(task.dueDate) > new Date(project.dueDate)) {
        return res.status(404).json({
          message: err_date_2,
        });
      }
      if (new Date(task.sDate) < new Date(project.sDate)) {
        return res.status(404).json({
          message: err_date_3,
        });
      }
      if (new Date(task.sDate) > new Date(project.dueDate)) {
        return res.status(404).json({
          message: err_date_4,
        });
      }
    }
    if (task.parentTask) {
      const getAllSubTasks = await mongoose
        .model("task")
        .find({ parentTask: task.parentTask });
      const parentTask = await mongoose.model("task").findById(task.parentTask);
      if (!parentTask) {
        return next(new AppError(err_2, 404));
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
        return next(new AppError(err_valid_1, 400));
      }
      if (parentTask.invoicedQuantity < totalInvoicedQuantity) {
        return next(new AppError(err_valid_2, 400));
      }
      if (parentTask.executedQuantity < totalExecutedQuantity) {
        return next(new AppError(err_valid_3, 400));
      }
      if (parentTask.approvedQuantity < totalApprovedQuantity) {
        return next(new AppError(err_valid_4, 400));
      }
      let newSubTaskLog = await taskLogModel.findOneAndUpdate(
        { taskId: task.parentTask },
        {
          $push: {
            updates: [
              {
                changes_en: [`${user.name} Created a Sub Task`],
                changes_ar: [`${user.name} تم انشاء مهمة فرعية`],
              },
            ],
          },
        },
        { new: true }
      );
    }
  }

  let addedTasks = await taskModel.insertMany(tasks);
  let taskIds = addedTasks.map((task) => task._id);
  await projectModel.findByIdAndUpdate(
    addedTasks[0].project,
    { $push: { tasks: { $each: taskIds } } },
    { new: true }
  );
  let taskLogs = taskIds.map((taskId) => {
    return new taskLogModel({
      taskId: taskId,
      updates: [
        {
          changes_en: [`${user.name} Created a Task`],
          changes_ar: [`${user.name} تم انشاء مهمة `],
        },
      ],
    });
  });
  await taskLogModel.insertMany(taskLogs);
  res.status(201).json({
    message: "Task(s) have been created successfully!",
    addedTasks,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let err_1 = "No Task was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مهام";
  }
  let ApiFeat = null;

  if (req.query.filterValue == "Approved") {
    ApiFeat = new ApiFeature(
      taskModel
        .find({ isAproved: true })
        .populate("project")
        .sort({ $natural: -1 }),
      req.query
    )
      .sort()
      .search();
  } else if (req.query.filterValue == "Waiting") {
    ApiFeat = new ApiFeature(
      taskModel
        .find({ taskStatus: "waiting" })
        .populate("project")
        .sort({ $natural: -1 }),
      req.query
    );
  } else if (req.query.filterValue == "Finished") {
    ApiFeat = new ApiFeature(
      taskModel
        .find({ taskStatus: "completed" })
        .populate("project")
        .sort({ $natural: -1 }),
      req.query
    );
  } else if (req.query.filterValue == "Delayed") {
    ApiFeat = new ApiFeature(
      taskModel
        .find({ taskStatus: "delayed" })
        .populate("project")
        .sort({ $natural: -1 }),
      req.query
    );
  } else {
    ApiFeat = new ApiFeature(
      taskModel.find().populate("project").sort({ $natural: -1 }),
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
      message: err_1,
    });
  }
  // let { filterType, filterValue } = req.query;
  // if (filterType && filterValue) {
  //   results = results.filter(function (item) {
  //     if (filterType == "title") {
  //       return item.title.toLowerCase().includes(filterValue.toLowerCase());
  //     }
  //     if (filterType == "taskStatus") {
  //       return item.taskStatus
  //         .toLowerCase()
  //         .includes(filterValue.toLowerCase());
  //     }
  //     if (filterType == "taskPriority") {
  //       return item.taskPriority
  //         .toLowerCase()
  //         .includes(filterValue.toLowerCase());
  //     }
  //     if (filterType == "project") {
  //       return item.project.name
  //         .toLowerCase()
  //         .includes(filterValue.toLowerCase());
  //     }
  //   });
  // }

  res.json({
    message: "Done",
    // count: await taskModel.countDocuments(),
    results,
  });
});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let err_1 = "No Task was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مهام";
  }
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
      message: err_1,
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
  let err_1 = "No Task was found!";
  if (req.query.lang == "ar") {
    err_1 = "لا يوجد مهام";
  }
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
      message: err_1,
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
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let results = await taskModel
    .findById(id)
    .populate("assignees")
    .populate("project")
    .populate("notes.postedBy")
    .populate("createdBy")
    .lean({ virtuals: true });

  if (!results) {
    return res.status(404).json({ message: err_1 });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getAllAssigness = catchAsync(async (req, res, next) => {
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let results = await taskModel
    .findById(req.params.id)
    .select("assignees")
    .populate("assignees");
  if (!results) {
    return res.status(404).json({ message: err_1 });
  }

  res.json({
    message: "Done",
    results,
  });
});
const scheduleRecurringTasks = catchAsync(async (req, res, next) => {
  let check = await projectModel.findById(req.params.projectId);
  let check2 = await taskModel.findById(req.params.id);
  let err_1 = "Task not found!";
  let err_2 = "Project not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
    err_2 = "المشروع غير موجود";
  }
  if (!check || check2) {
    return res.status(404).json({ message: err_2 });
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
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let results = await taskModel
    .find({ parentTask: req.params.id })
    .populate({
      path: "assignees",
      select: "_id profilePic name",
    })
    .populate("parentTask");
  if (!results) {
    return res.status(404).json({ message: err_1 });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getAllParentTasks = catchAsync(async (req, res, next) => {
  let userId = new mongoose.Types.ObjectId(req.params.id);
  let projectId = new mongoose.Types.ObjectId(req.params.projectId);
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let results = await taskModel
    .find({
      $and: [
        { project: projectId },
        { parentTask: null },
        { $or: [{ createdBy: userId }, { assignees: userId }] },
      ],
    })
    .select("title _id");

  if (!results) {
    return res.status(404).json({ message: err_1 });
  }

  res.json({
    message: "Done",
    results,
  });
});

const updateTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.query.id;
  const updatedFields = req.body; // Assume updates come from request body

  const { documents, assignees, notes, attachments, ...otherUpdatedFields } =
    updatedFields;

  let err_1 = "Task not found!";
  let err_2 = "User not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
    err_2 = "المستخدم غير موجود";
  }

  try {
    const updatedTask = await taskModel.findByIdAndUpdate(
      id,
      {
        $push: {
          documents: { $each: Array.isArray(documents) ? documents : [] },
          assignees: { $each: Array.isArray(assignees) ? assignees : [] },
          notes: {
            content: notes,
            postedBy: userId,
            createdAt: Date.now(),
            // required: true,
          },
          attachments: { $each: Array.isArray(attachments) ? attachments : [] },
          // approvalOfSchemesModel: { $each: approvalOfSchemesModel || [] },
          // workRequestModel: { $each: workRequestModel || [] },
          // requestForMaterialAndEquipmentInspection: {
          //   $each: requestForMaterialAndEquipmentInspection || [],
          // },
          // requestForApprovalOfMaterialsModel: {
          //   $each: requestForApprovalOfMaterialsModel || [],
          // },
          // requestForDrawingSubmittalApproval: {
          //   $each: requestForDrawingSubmittalApproval || [],
          // },
          // tableOfQuantitiesModel: { $each: tableOfQuantitiesModel || [] },
        },
        ...otherUpdatedFields,
      },
      { new: true, context: { query: req.query } }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: err_1 });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: err_2 });
    }
    let message_en = "";
    let message_ar = "";
    if (req.body.assignees) {
      if (!Array.isArray(req.body.assignees)) {
        req.body.assignees = [req.body.assignees];
      }
      message_en = `You have assigned in new task \' ${updatedTask.title}\' !`;
      message_ar = ` لقد تمت تعيينك في مهمة جديدة \' ${updatedTask.title} '\ !`;
      sendNotification(message_en, message_ar, "warning", req.body.assignees);
    }
    if (req.body.isAproved == true) {
      message_en = ` The task ${updatedTask.title} has been approved !`;
      message_ar = ` تم الموافقة عليها المهمة ${updatedTask.title} !`;
      sendNotification(
        message_en,
        message_ar,
        "warning",
        updatedTask.assignees
      );
    }
    if (req.body.taskPriority) {
      if (req.body.taskPriority == "high") {
        message_en = ` The task \' ${updatedTask.title}\' has been Highly Prioritized !`;
        message_ar = ` تم تصنيف المهمة \'${updatedTask.title}\' ذات أولوية عالية !`;
        sendNotification(
          message_en,
          message_ar,
          "warning",
          updatedTask.assignees
        );
      }
      if (req.body.taskPriority == "medium") {
        message_en = ` The task \' ${updatedTask.title} \' has been Medium Prioritized !`;
        message_ar = ` تم تصنيف المهمة \' ${updatedTask.title} \' ذات أولوية متوسطة !`;
        sendNotification(
          message_en,
          message_ar,
          "warning",
          updatedTask.assignees
        );
      }
      if (req.body.taskPriority == "low") {
        message_en = ` The task \' ${updatedTask.title}\' has been Low Prioritized !`;
        message_ar = ` تم تصنيف المهمة \' ${updatedTask.title} \' ذات أولوية منخفضة !`;
        sendNotification(
          message_en,
          message_ar,
          "warning",
          updatedTask.assignees
        );
      }
    }

    const changes_en = generateChangeLogs(updatedFields, user.name);
    const changes_ar = generateChangeLogsArabic(updatedFields, user.name);

    await taskLogModel.findOneAndUpdate(
      { taskId: id },
      {
        $push: { updates: [{ changes_en }, { changes_ar }] },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Task updated successfully!",
      updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const generateChangeLogs = (updatedFields, userName) => {
  const fieldMappings = {
    title: "Task Title",
    sDate: "Start Date",
    dueDate: "End Date",
    requestForInspectionForm: "Request For Inspection Form Model",
    tableOfQuantities: "Table Of Quantities",
    description: "Description",
    approvalOfSchemes: "Approval Of Schemes Model",
    workRequest: "Work Request Model",
    requestForApprovalOfMaterials: "Request For Approval Of Materials Model",
    requestForDocumentSubmittalApproval:
      "Request For Document Submittal Approval Model",
    taskStatus: "Task Status",
    taskPriority: "Task Priority",
    isAproved: "Approved Task",
    total: "Task Total",
    invoicedQuantity: "Invoiced Quantity",
    executedQuantity: "Executed Quantity",
    approvedQuantity: "Approved Quantity",
    requiredQuantity: "Required Quantity",
    unit: "Task Unit",
    price: "Task Price",
    progress: "Task Progress",
    notes: "Task Notes",
    assignees: "Task Assignees",
    documents: "Task Documents",
    attachments: "Task Attachments",
    // approvalOfSchemesModel: "Approval Of Schemes Model",
    // workRequestModel: "Work Request Model",
    // requestForMaterialAndEquipmentInspection:
    //   "Request For Inspection Form Model",
    // requestForApprovalOfMaterialsModel:
    //   "Request For Approval Of Materials Model",
    // requestForDrawingSubmittalApproval:
    //   "Request For Document Submittal Approval Model",
    // tableOfQuantitiesModel: "Table Of Quantities Model",
  };

  return Object.entries(updatedFields)
    .filter(([key]) => fieldMappings[key]) // Only include mapped fields
    .map(([key]) => `${userName} updated ${fieldMappings[key]}`);
};
const generateChangeLogsArabic = (updatedFields, userName) => {
  const fieldMappings = {
    title: "اسم المهمة",
    sDate: "تاريخ البدء",
    dueDate: "تاريخ الانتهاء",
    requestForInspectionForm: " طلب استمارة المراجعة",
    tableOfQuantities: "جدول الكميات",
    description: " الوصف",
    approvalOfSchemes: "نموذج الموافقة على المخططات",
    workRequest: "نموذج طلب العمل",
    requestForApprovalOfMaterials: "طلب الموافقة على المواد",
    requestForDocumentSubmittalApproval: "طلب الموافقة على المستندات",
    taskStatus: "حالة المهمة",
    taskPriority: "أولوية المهمة",
    isAproved: "المهمة معتمدة",
    total: "المجموع",
    invoicedQuantity: "الكمية المفوترة",
    executedQuantity: "الكمية المنفذة",
    approvedQuantity: "الكمية المعتمدة",
    requiredQuantity: "الكمية المطلوبة",
    unit: " وحدة المهمة",
    price: "سعر المهمة",
    progress: "تقدم المهمة",
    notes: "ملاحظات المهمة",
    assignees: "المكلفون",
    documents: "مستندات المهمة",
    attachments: "ملفات المهمة",
    // approvalOfSchemesModel: "نموذج الموافقة على المخططات",
    // workRequestModel: "نموذج طلب العمل",
    // requestForMaterialAndEquipmentInspection: " طلب استمارة المراجعة",
    // requestForApprovalOfMaterialsModel: "طلب الموافقة على المواد",
    // requestForDrawingSubmittalApproval: "طلب الموافقة على المستندات",
    // tableOfQuantitiesModel: "جدول الكميات",
  };
  return Object.entries(updatedFields)
    .filter(([key]) => fieldMappings[key])
    .map(([key]) => `${userName} قام بتحديث ${fieldMappings[key]}`);
};

const updateTask2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let { documents, assignees, notes, attachments } = req.body;
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,

    {
      $pull: {
        documents,
        assignees,
        notes,
        attachments,
        // approvalOfSchemesModel,
        // workRequestModel,
        // requestForMaterialAndEquipmentInspection,
        // requestForApprovalOfMaterialsModel,
        // requestForDrawingSubmittalApproval,
        // tableOfQuantitiesModel,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: err_1 });
  }
  let user = await userModel.findById(req.query.id);
  let changes_en = [];
  let changes_ar = [];
  if (req.body.notes) {
    changes_en.push(`${user.name} Deleted Task Note`);
    changes_ar.push(`${user.name} حذف ملاحظة المهمة`);
  }
  if (req.body.assignees) {
    changes_en.push(`${user.name} Deleted user from task`);
    changes_ar.push(`${user.name} حذف المستخدم من المهمة`);
  }
  // if (req.body.approvalOfSchemesModel) {
  //   changes_en.push(`${user.name} Deleted approval Of Schemes Model from task`);
  //   changes_ar.push(`${user.name} حذف نموذج الموافقة على المخططات من المهمة`);
  // }
  // if (req.body.workRequestModel) {
  //   changes_en.push(`${user.name} Deleted work Request Model from task`);
  //   changes_ar.push(`${user.name} حذف نموذج طلب العمل من المهمة`);
  // }
  // if (req.body.requestForMaterialAndEquipmentInspection) {
  //   changes_en.push(
  //     `${user.name} Deleted request For Inspection Form Model from task`
  //   );
  //   changes_ar.push(`${user.name} حذف طلب استمارة المراجعة من المهمة`);
  // }
  // if (req.body.requestForApprovalOfMaterialsModel) {
  //   changes_en.push(
  //     `${user.name} Deleted request For Approval Of Materials Model from task`
  //   );
  //   changes_ar.push(`${user.name} حذف طلب الموافقة على المواد من المهمة`);
  // }
  // if (req.body.requestForDrawingSubmittalApproval) {
  //   changes_en.push(
  //     `${user.name} Deleted request For Document Submittal Approval Model from task`
  //   );
  //   changes_ar.push(`${user.name} حذف طلب الموافقة على المستندات من المهمة`);
  // }
  // if (req.body.tableOfQuantitiesModel) {
  //   changes_en.push(`${user.name} Deleted table Of Quantities Model from task`);
  //   changes_ar.push(`${user.name} حذف جدول الكميات من المهمة`);
  // }
  if (req.body.documents) {
    changes_en.push(`${user.name} Deleted Task Document`);
    changes_ar.push(`${user.name} حذف مستند المهمة`);
    if (!Array.isArray(req.body.documents)) {
      req.body.documents = [req.body.documents];
    }
    removeFiles("documents", req.body.documents);
  }
  if (req.body.attachments) {
    changes_en.push(`${user.name} Deleted Task Attachment`);
    changes_ar.push(`${user.name} حذف ملف المهمة`);
    if (!Array.isArray(req.body.attachments)) {
      req.body.attachments = [req.body.attachments];
    }
    removeFiles("documents", req.body.attachments);
  }
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes_en: changes_en,
            changes_ar: changes_ar,
          },
        ],
      },
    },
    { new: true }
  );

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err_1 = "Task not found!";
  if (req.query.lang == "ar") {
    err_1 = "المهمة غير موجودة";
  }
  let subTask = await taskModel.findById(id);
  if (subTask.parentTask) {
    let user = await userModel.findById(req.query.id);
    let newTaskLog = await taskLogModel.findOneAndUpdate(
      { taskId: subTask.parentTask },
      {
        $push: {
          updates: [
            {
              changes_en: [`${user.name} deleted subtask`],
              changes_ar: [`${user.name} حذف مهمة فرعية`],
            },
          ],
        },
      },
      { new: true }
    );
  }
  let deletedTask = await taskModel.deleteOne({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: err_1 });
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
