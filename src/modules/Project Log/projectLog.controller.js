import { projectLogModel } from "../../../database/models/projectLog.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createProjectLog = catchAsync(async (req, res, next) => {
  req.body.model = "66ba017594aef366c6a8def1"

  if (req.body.budget && req.body.budget >= 0) {
    let newProjectLog = new projectLogModel(req.body);
    let addedProjectLog = await newProjectLog.save();
    res.status(201).json({
      message: " ProjectLog has been created successfully!",
      addedProjectLog,
    });
  } else {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
});
const updateProjectLogDocs = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let documents = "";
  if (req.files.documents) {
    req.body.documents =
      req.files.documents &&
      req.files.documents.map(
        (file) =>
          `http://localhost:8000/documents/${file.filename.split(" ").join("_")}`
      );

    const directoryPathh = path.join(documents, "uploads/documents");

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
  let updatedTask = await projectLogModel.findByIdAndUpdate(
    id,
    { $push: { documents: documents } },
    { new: true }
  );
  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!", documents });
});

const getProjectLogById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await projectLogModel.findById(id);
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "Done", results });
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: " ProjectLog Not found!",
    });
  }

  res.json({
    message: "done",
    results,
  });
});
////////////////////////////////// admin \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const getAllProjectLogByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectLogModel
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
      message: "No ProjectLog was found!",
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
    count: await projectLogModel.countDocuments(),
    results,
  });
});
const getAllProjectLogByStatusByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectLogModel
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
      message: "No ProjectLog was found!",
    });
  }

  res.json({
    message: "done",
    count: await projectLogModel.countDocuments(),
    results,
  });
});
const getAllProjectLogByStatusByUser = catchAsync(async (req, res, next) => {
  let foundUser = await userModel.findById(req.params.id);
  // console.log(foundUser,"foundUser");
  if (!foundUser) {
    return res.status(404).json({ message: "User not found!" });
  }
  let ApiFeat = new ApiFeature(
    projectLogModel
      .find({
        $and: [
          { _id: { $in: foundUser.ProjectLogs } },
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
      message: "No ProjectLog was found!",
    });
  }

  res.json({
    message: "done",
    count: await projectLogModel.countDocuments(),
    results,
  });
});
const getAllDocsProjectLog = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(projectLogModel.findById(req.params.id), req.query)
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
    message: "done",
    documents,
  });
});
const getAllProjectLogByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    projectLogModel
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
      message: "No ProjectLog was found!",
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
    count: await projectLogModel.countDocuments(),
    results,
  });
});

////////////////////////////////// contractor \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////// consultant \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const updateProjectLog = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.budget < 0) {
    return res.status(404).json({ message: "Budget must be greater than 0" });
  }
  const updatedProjectLog = await projectLogModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedProjectLog) {
    return res.status(404).json({ message: "ProjectLog not found!" });
  }
  res.status(200).json({
    message: "ProjectLog updated successfully!",
    updatedProjectLog,
  });
});
const updateProjectLogMembers = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.members) {
    let updatedTask = await projectLogModel.findByIdAndUpdate(
      id,
      { $push: { members: req.body.members } },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Couldn't update!  not found!" });
    }
    res
      .status(200)
      .json({ message: "Task updated successfully!", updatedTask });
  }
});

const deleteProjectLog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedProjectLog = await projectLogModel.findByIdAndDelete(id);
  if (!deletedProjectLog) {
    return res.status(404).json({ message: "ProjectLog not found!" });
  }
  res.status(200).json({ message: "ProjectLog deleted successfully!" });
});

export {
  deleteProjectLog,
  updateProjectLog,
  getAllProjectLogByAdmin,
  createProjectLog,
  updateProjectLogDocs,
  getProjectLogById,
  getAllDocsProjectLog,
  getAllProjectLogByStatusByAdmin,
  getAllProjectLogByStatusByUser,
  updateProjectLogMembers,
};
