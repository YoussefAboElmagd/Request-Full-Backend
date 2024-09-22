import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { taskModel } from "../../../database/models/tasks.model.js";

const createProject = catchAsync(async (req, res, next) => {
    req.body.model = "66ba015a73f994dd94dbc1e9";
    if (req.body.budget < 0) {
      return res.status(404).json({ message: "Budget must be greater than 0" });
    }
    let newProject = new projectModel(req.body);
    let addedProject = await newProject
    addedProject.members.push(addedProject.createdBy);
    addedProject.members.push(addedProject.contractor);
    addedProject.members.push(addedProject.owner);
    addedProject.members.push(addedProject.consultant);
    addedProject.members.push(addedProject.mainConsultant);
    addedProject.members = addedProject.members.filter((item, index) => addedProject.members.indexOf(item) === index);

    await addedProject.save();
    res.status(201).json({
      message: " Project has been created successfully!",
      addedProject,
    });

});

const getProjectById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await projectModel.findById(id).populate("contractor")
  .populate("consultant")
  .populate("mainConsultant")
  .populate("members")
  .populate("owner");
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "Done", results });
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: " Project Not found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
////////////////////////////////// admin \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const getAllProjectByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel
      .find()
      .populate("contractor")
      .populate("consultant")
      .populate("mainConsultant")
      .populate("createdBy")
      .populate("members")
      .populate("owner"),
    req.query
  )
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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "status") {
        return item.status.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "description") {
        return item.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      // if (filterType == "date") {
      //   return item.dueDate.includes(filterValue);
      // }
      if (filterType == "createdBy") {        
        return item.createdBy.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      // if (filterType == "members") {
      //   if (item.members) {
      //    return item.members.filter(item => item.name.toLowerCase().includes(filterValue.toLowerCase()));
      //   }
      // }
    });
  }

  res.json({
    message: "Done",
    count: await projectModel.countDocuments(),
    results,
  });
});
const getAllProjectByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel
      .find({ members: { $in: req.params.id } })
      .sort({ $natural: -1 })
      .select("tasks name")
      .populate({
        path: 'tasks',
        select: 'title taskPriority taskStatus assignees documents startDate dueDate notes',
        match: { assignees: { $in: req.params.id } }, // Filter tasks with the assignee matching req.params.id
        populate: {
          path: 'assignees',
          model: 'user',
          select: '_id name profilePic'
        }
      }),
    req.query
  )
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
  results.forEach(project => {
    project.taskCount= project.tasks.length
    project.tasks.forEach(task => {
      task.documentsLength = task.documents.length;
      task.notesLength = task.notes.length;
      delete task.notes
      delete task.updatedAt
      delete task.isDelayed
      delete task.documents;
    })})
  let { filterType, filterValue } = req.query;
  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "description") {
        return item.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const getAllAnalyticsByUser = catchAsync(async (req, res, next) => {
  res.json({
    message: "Done",
    countProjects: await projectModel.countDocuments({
      members: { $in: req.params.id },
    }),
    totalTasks: await taskModel.countDocuments({ assignees: { $in: req.params.id } }),
    delayedTasks: await taskModel.countDocuments({$and:[
      { assignees: { $in: req.params.id } },
      {isDelayed: true}
    ]
    }),
    inProgressTasks: await taskModel.countDocuments({$and:[
      { assignees: { $in: req.params.id } },
      {taskStatus: "working"}
    ]
    }),
    completedTasks: await taskModel.countDocuments({$and:[
      { assignees: { $in: req.params.id } },
      {taskStatus: "completed"}
    ]
    }),
  });
});
const getAllProjectByStatusByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel
      .find({ status: req.query.status })
      .populate("contractor")
      .populate("consultant")
      .populate("mainConsultant")
      .populate("members")
      .populate("owner"),
    req.query
  )
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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "description") {
        return item.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      // if (filterType == "date") {
      //   return item.dueDate.includes(filterValue);
      // }
      // if (filterType == "budget") {
      //   return item.budget.toString().includes(filterValue);
      // }
      if (filterType == "createdBy") {
        return item.createdBy.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "members") {
        if (item.members[0]) {
          return item.members[0].name
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
      }
    });
  }

  res.json({
    message: "Done",
    count: await projectModel.countDocuments({ status: req.query.status }),
    results,
  });
});
const getAllProjectByStatusByUser = catchAsync(async (req, res, next) => {
  let foundUser = await userModel.findById(req.params.id);
  // console.log(foundUser,"foundUser");
  if (!foundUser) {
    return res.status(404).json({ message: "User not found!" });
  }
  let ApiFeat = new ApiFeature(
    projectModel
      .find({
        $and: [
          { _id: { $in: foundUser.projects } },
          { status: req.query.status },
        ],
      })
      .populate("contractor")
      .populate("consultant")
      .populate("mainConsultant")
      .populate("members")
      .populate("owner"),
    req.query
  )
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
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "description") {
        return item.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      // if (filterType == "date") {
      //   return item.dueDate.includes(filterValue);
      // }
      // if (filterType == "budget") {
      //   return item.budget.toString().includes(filterValue);
      // }
      if (filterType == "createdBy") {
        return item.createdBy.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "members") {
        if (item.members[0]) {
          return item.members[0].name
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
      }
    });
  }

  res.json({
    message: "Done",
    count: await projectModel.countDocuments(),
    results,
  });
});
const getAllDocsProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel.findById(req.params.id).populate("documents"),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Project was found!",
    });
  }
  let documents = [];
  if (results.documents) {
    documents = results.documents;
  }

  res.json({
    message: "Done",
    documents,
    count: documents.length,
  });
});
const getAllMembersProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel.findById(req.params.id).populate({
      path: 'members',
      model: 'user',
      select: '_id name profilePic' // Select only _id and profilePic for assignees
    }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Project was found!",
    });
  }  
  let members = [];
  if (results.members) {
    members = results.members;
  }

  res.json({
    message: "Done",
    count: members.length,
    members,
  });
});

const getAllProjectsFilesByAdmin = catchAsync(async (req, res, next) => {
  let results = await projectModel.aggregate([
    {
      // Group by project _id
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        documents: { $first: "$documents" },
      },
    },
    {
      // Optionally, sort the projects by name or any other field
      $sort: { name: 1 },
    },
  ]);

  // Populate documents and createdBy fields in each project
  results = await projectModel.populate(results, { path: "documents" });

  res.json({
    message: "Done",
    results,
  });
});
const getAllProjectsFilesByUser = catchAsync(async (req, res, next) => {
  const memberId = new mongoose.Types.ObjectId(req.params.id);

  let results = await projectModel.aggregate([
    {
      // Match projects where members are in the provided memberIds
      $match: { members: memberId },
    },
    {
      // Group by project _id
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        documents: { $first: "$documents" },
      },
    },
    {
      // Optionally, sort the projects by name or any other field
      $sort: { name: 1 },
    },
  ]);

  // Populate documents and createdBy fields in each project
  results = await projectModel.populate(results, { path: "documents" });

  res.json({
    message: "Done",
    results,
  });
});


const updateProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.budget < 0) {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
  let {
    name,
    description,
    status,
    sDate,
    dueDate,
    documents,
    tasks,
    members,
    contractor,
    consultant,
    owner,
    team,
    budget,
  } = req.body;
  const updatedProject = await projectModel.findByIdAndUpdate(
    id,
    {
      name,
      description,
      status,
      sDate,
      dueDate,
      $push: {
        documents,
        tasks,
        members,
        contractor,
        consultant,
        owner,
      },
      team,
      budget,
    },
    { new: true }
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

export {
  deleteProject,
  updateProject,
  getAllProjectByAdmin,
  createProject,
  getProjectById,
  getAllDocsProject,
  getAllProjectByStatusByAdmin,
  getAllProjectByStatusByUser,
  getAllProjectsFilesByUser,
  getAllProjectByUser,
  getAllProjectsFilesByAdmin,
  getAllAnalyticsByUser,
  getAllMembersProject,
};
