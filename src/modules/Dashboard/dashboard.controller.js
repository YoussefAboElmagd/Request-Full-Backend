import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { taskModel } from "../../../database/models/tasks.model.js";
import { tagsModel } from "../../../database/models/tags.model.js";
import { requsetModel } from "../../../database/models/request.model.js";

const getTopCountries = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  let results = await userModel.aggregate([
    {
      $group: {
        _id: "$country",  // Assuming your user model has a 'country' field
        userCount: { $sum: 1 }  // Count the number of users per country
      }
    },
    {
      $sort: { userCount: -1 }  // Sort by user count in descending order
    },
    {
      $limit: 10  // Limit the result to the top 10
    }
  ]);
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  res.json({
    message: "Done",
    results,
  });
});
const getUserRatioPieChart = catchAsync(async (req, res, next) => {
  const totalUsers = await userModel.countDocuments();
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  let results = await userModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }  
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        name: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", totalUsers] }, 100]
        }
      }
    },
    {
      $sort: { count: -1 } 
    },
  ]);
  results= await userModel.populate(results, {
    path: "_id",
    model: "userType",
    select: "jobTitle", 
  });
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  res.json({
    message: "Done",
    results,
  });
});
const getTagsRatio = catchAsync(async (req, res, next) => {
  const totalTags = await tagsModel.countDocuments();
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  let results = await userModel.aggregate([
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }  
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", totalTags] }, 100] 
        }
      }
    },
    {
      $sort: { count: -1 } 
    },
  ]);
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  results= await tagsModel.populate(results, {
    path: "_id",
    model: "tag",
    select: "name", 
  });
  res.json({
    message: "Done",
    results,
  });
});
const getMostModels = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  const totalProjects = await projectModel.countDocuments();
  const totalRequestForDocumentSubmittalApproval = await projectModel.countDocuments({requestForDocumentSubmittalApproval: true});
  const totalRequestForApprovalOfMaterials = await projectModel.countDocuments({requestForApprovalOfMaterials: true});
  const totalWorkRequest = await projectModel.countDocuments({workRequest: true});
  const totalTableOfQuantities = await projectModel.countDocuments({tableOfQuantities: true});
  const totalRequestForInspectionForm = await projectModel.countDocuments({requestForInspectionForm: true});
  const totalApprovalOfSchemes = await projectModel.countDocuments({approvalOfSchemes: true});

  let results = {
    totalRequestForDocumentSubmittalApproval:{
      count: totalRequestForDocumentSubmittalApproval,
      percentage: (totalRequestForDocumentSubmittalApproval/totalProjects)*100
    },
    totalRequestForApprovalOfMaterials: {
      count: totalRequestForApprovalOfMaterials,
      percentage: (totalRequestForApprovalOfMaterials/totalProjects)*100
    },
    totalWorkRequest: {
      count: totalWorkRequest,
      percentage: (totalWorkRequest/totalProjects)*100
    },
    totalTableOfQuantities: {
      count: totalTableOfQuantities,
      percentage: (totalTableOfQuantities/totalProjects)*100
    },
    totalRequestForInspectionForm: {
      count: totalRequestForInspectionForm,
      percentage: (totalRequestForInspectionForm/totalProjects)*100
    },
    totalApprovalOfSchemes: {
      count: totalApprovalOfSchemes,
      percentage: (totalApprovalOfSchemes/totalProjects)*100
    },

  }
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateDashboard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  const updatedDashboard = await DashboardCodeModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedDashboard) {
    return res.status(404).json({ message: err_1});
  }
  res.status(200).json({
    message: "Dashboard updated successfully!",
    updatedDashboard,
  });
});
const getActiveProjects= catchAsync(async (req, res, next) => {
  let err_1 = "No Project was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد مشاريع"
  }
  let ApiFeat = new ApiFeature(
    projectModel.aggregate([
      {
        $match: { status: "working" }
      },
      {
        $lookup: {
          from: "users", // Assuming the 'members' refer to the user model
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      {
        $project: {
          name: 1,
          members: {
            _id: 1,
            name: 1,
            profilePic: 1
          },
          progress: 1,
          tasksCount: { $size: "$tasks" } // Count the number of tasks
        }
      }
    ]),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }

  res.json({
    message: "Done",
    results,
  });
});
const getActiveProjectsByUser= catchAsync(async (req, res, next) => {
  let id =new mongoose.Types.ObjectId(req.params.id)
  let err_1 = "No Project was found!"
  let err_2 = "User not found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد مشاريع"
    err_2 = "المستخدم غير موجود"
  }
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: err_2 });
}
  let ApiFeat = new ApiFeature(
    projectModel.aggregate([
      {
        $match: 
          { $and: [{ members:  id  }, { status: "working" }] } 
      },
      {
        $lookup: {
          from: "users", // Assuming the 'members' refer to the user model
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      {
        $project: {
          name: 1,
          members: {
            _id: 1,
            name: 1,
            profilePic: 1
          },
          progress: 1,
          tasksCount: { $size: "$tasks" } // Count the number of tasks
        }
      }
    ]),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getProjectPerformance = catchAsync(async (req, res, next) => {
  let totalProjects = await projectModel.countDocuments(); // Get the total number of projects
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  let results = await projectModel.aggregate([
    {
      $addFields: {
        statusCategory: {
          $cond: {
            if: { $in: ["$status", ["delayed", "waiting"]] }, // Combine "delayed" and "waiting" into "behind"
            then: "behind",
            else: "$status"
          }
        }
      }
    },
    {
      $group: {
        _id: "$statusCategory", 
        count: { $sum: 1 }      
      }
    },
    {
      $facet: {
        results: [
          {
            $project: {
              _id: 1,
              count: 1,
              percentage: {
                $multiply: [{ $divide: ["$count", totalProjects] }, 100]
              }
            }
          }
        ],
        allStatuses: [
          {
            $project: {
              _id: {
                $literal: ["working", "completed", "behind"]
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        results: {
          $concatArrays: [
            "$results",
            {
              $map: {
                input: {
                  $setDifference: [{ $arrayElemAt: ["$allStatuses._id", 0] }, "$results._id"]
                },
                as: "missingStatus",
                in: { _id: "$$missingStatus", count: 0, percentage: 0 }
              }
            }
          ]
        }
      }
    },
    {
      $unwind: "$results"
    },
    {
      $replaceRoot: { newRoot: "$results" }
    },
    {
      $sort: { count: -1 } // Sort by count, descending
    }
  ]);
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  res.json({
    message: "Done",
    results,
  });
});
const getProjectPerformanceByUser = catchAsync(async (req, res, next) => {
  let totalProjects = await projectModel.countDocuments(); // Get the total number of projects
  let id =new mongoose.Types.ObjectId(req.params.id)
  let err_1 = "No Project was found!"
  let err_2 = "User not found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد مشاريع"
    err_2 = "المستخدم غير موجود"
  }
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: err_2 });
}
  let results = await projectModel.aggregate([
    {
      $match: 
      { members:  id  }
    },
    {
      $addFields: {
        statusCategory: {
          $cond: {
            if: { $in: ["$status", ["delayed", "waiting"]] }, // Combine "delayed" and "waiting" into "behind"
            then: "behind",
            else: "$status"
          }
        }
      }
    },
    {
      $group: {
        _id: "$statusCategory", 
        count: { $sum: 1 }      
      }
    },
    {
      $facet: {
        results: [
          {
            $project: {
              _id: 1,
              count: 1,
              percentage: {
                $multiply: [{ $divide: ["$count", totalProjects] }, 100]
              }
            }
          }
        ],
        allStatuses: [
          {
            $project: {
              _id: {
                $literal: ["working", "completed", "behind"]
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        results: {
          $concatArrays: [
            "$results",
            {
              $map: {
                input: {
                  $setDifference: [{ $arrayElemAt: ["$allStatuses._id", 0] }, "$results._id"]
                },
                as: "missingStatus",
                in: { _id: "$$missingStatus", count: 0, percentage: 0 }
              }
            }
          ]
        }
      }
    },
    {
      $unwind: "$results"
    },
    {
      $replaceRoot: { newRoot: "$results" }
    },
    {
      $sort: { count: -1 } // Sort by count, descending
    }
  ]);
  if(!results){
    return res.status(404).json({
      message: err_1,
    })
  }
  res.json({
    message: "Done",
    results,
  });
});


const weeklyActivity = catchAsync(async (req, res, next) => {
  let err_1 = "No Data was found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد بيانات"
  }
  const weeklyActivity = await taskModel.aggregate([
    {
      $match: {
        // Get tasks created within the last 7 days
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      }
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // Group by day of the week (1 = Sunday, 7 = Saturday)
          taskStatus: "$taskStatus" // Group by task status (delayed, working, completed)
        },
        count: { $sum: 1 } // Count the number of tasks
      }
    },
    {
      $group: {
        _id: "$_id.dayOfWeek",
        statuses: {
          $push: {
            taskStatus: "$_id.taskStatus",
            count: "$count"
          }
        }
      }
    },
    {
      $sort: { _id: 1 } 
    }
  ]);

  const daysOfWeek = [
    { dayOfWeek: 1, name: "Sunday" },
    { dayOfWeek: 2, name: "Monday" },
    { dayOfWeek: 3, name: "Tuesday" },
    { dayOfWeek: 4, name: "Wednesday" },
    { dayOfWeek: 5, name: "Thursday" },
    { dayOfWeek: 6, name: "Friday" },
    { dayOfWeek: 7, name: "Saturday" }
  ];

  let results = daysOfWeek.map(day => {
    const activityForDay = weeklyActivity.find(activity => activity._id === day.dayOfWeek);

    const data = {
      day: day.name,   // Day of the week (Sunday, Monday, etc.)
      delayed: 0,
      working: 0,
      completed: 0
    };

    if (activityForDay) {
      activityForDay.statuses.forEach(status => {
        if (status.taskStatus === 'delayed') data.delayed = status.count;
        if (status.taskStatus === 'working') data.working = status.count;
        if (status.taskStatus === 'completed') data.completed = status.count;
      });
    }

    return data;
  });

  if (!results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  res.json({
    message: "Done",
    results
  });
});
const weeklyActivityByUser = catchAsync(async (req, res, next) => {
  let err_1 = "No Project was found!"
  let err_2 = "User not found!"
  if(req.query.lang == "ar"){
    err_1 = "لا يوجد مشاريع"
    err_2 = "المستخدم غير موجود"
  }
  let id =new mongoose.Types.ObjectId(req.params.id)
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: err_2 });
}
const weeklyActivity = await taskModel.aggregate([
  {
    $match: {
      $match: 
      { $and: [{ members:  id  }, {createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7))} }] } 
      
    }
  },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // Group by day of the week (1 = Sunday, 7 = Saturday)
          taskStatus: "$taskStatus" // Group by task status (delayed, working, completed)
        },
        count: { $sum: 1 } // Count the number of tasks
      }
    },
    {
      $group: {
        _id: "$_id.dayOfWeek",
        statuses: {
          $push: {
            taskStatus: "$_id.taskStatus",
            count: "$count"
          }
        }
      }
    },
    {
      $sort: { _id: 1 } 
    }
  ]);

  const daysOfWeek = [
    { dayOfWeek: 1, name: "Sunday" },
    { dayOfWeek: 2, name: "Monday" },
    { dayOfWeek: 3, name: "Tuesday" },
    { dayOfWeek: 4, name: "Wednesday" },
    { dayOfWeek: 5, name: "Thursday" },
    { dayOfWeek: 6, name: "Friday" },
    { dayOfWeek: 7, name: "Saturday" }
  ];

  let results = daysOfWeek.map(day => {
    const activityForDay = weeklyActivity.find(activity => activity._id === day.dayOfWeek);

    const data = {
      day: day.name,   // Day of the week (Sunday, Monday, etc.)
      delayed: 0,
      working: 0,
      completed: 0
    };

    if (activityForDay) {
      activityForDay.statuses.forEach(status => {
        if (status.taskStatus === 'delayed') data.delayed = status.count;
        if (status.taskStatus === 'working') data.working = status.count;
        if (status.taskStatus === 'completed') data.completed = status.count;
      });
    }

    return data;
  });

  if (!results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  res.json({
    message: "Done",
    results
  });
});

export {  updateDashboard,getTopCountries ,getUserRatioPieChart ,getActiveProjects,getProjectPerformance ,getActiveProjectsByUser,getProjectPerformanceByUser,
  weeklyActivity ,weeklyActivityByUser ,getTagsRatio ,getMostModels
  };
