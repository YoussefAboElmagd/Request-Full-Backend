import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createProject = catchAsync(async (req, res, next) => {
  req.body.model = "66ba015a73f994dd94dbc1e9";
  req.body.members = req.body.createdBy;
  if (req.body.budget && req.body.budget >= 0) {
    let newProject = new projectModel(req.body);
    let addedProject = await newProject.save();
    res.status(201).json({
      message: " Project has been created successfully!",
      addedProject,
    });
  } else {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
});

const getProjectById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await projectModel.findById(id);
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
    message: "Done",
    count: await projectModel.countDocuments(),
    results,
  });
});
const getAllProjectByStatusByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectModel
      .find({ status: req.params.status })
      .populate("contractor")
      .populate("consultant")
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

  res.json({
    message: "Done",
    count: await projectModel.countDocuments(),
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

  res.json({
    message: "Done",
    count: await projectModel.countDocuments(),
    results,
  });
});
const getAllDocsProject = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(projectModel.findById(req.params.id), req.query)
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  let documents = [];
  if (results.documents) {
    documents = results.documents;
  }

  res.json({
    message: "Done",
    documents,
  });
});
const getAllProjectFiles = catchAsync(async (req, res, next) => {
  const memberId = new mongoose.Types.ObjectId(req.params.id);

  let results = await projectModel.aggregate([
    {
      // Match projects where members are in the provided memberIds
      $match: { members: memberId }
    },
    {
      // Group by project _id
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        documents: { $first: "$documents" },
      }
    },
    {
      // Optionally, sort the projects by name or any other field
      $sort: { name: 1 }
    }
  ]);
  
  // Populate documents and createdBy fields in each project
  results = await projectModel.populate(results, { path: "documents" });
  
  res.json({
    message: "Done",
    results,
  });});

////////////////////////////////// contractor \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////// consultant \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const updateProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.budget < 0) {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
  let { name, description, status, sDate, dueDate, budget, documents,tasks,members ,contractor,consultant,owner} = req.body;
  const updatedProject = await projectModel.findByIdAndUpdate(
    id,
    {
      name,
      description,
      status,
      sDate,
      dueDate,
      budget,
      $push: {
        documents,
        tasks,
        members,
        contractor,
        consultant,
        owner,
      },
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
  getAllProjectFiles,
};
