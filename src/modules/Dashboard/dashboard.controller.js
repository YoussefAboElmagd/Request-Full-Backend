import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { taskModel } from "../../../database/models/tasks.model.js";

const getAllDashboard = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(DashboardCodeModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Dashboard was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getTopCountries = catchAsync(async (req, res, next) => {
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
      message: "No Dashboard was found!",
    })
  }
  res.json({
    message: "Done",
    results,
  });
});
const getUserRatioPieChart = catchAsync(async (req, res, next) => {
  const totalUsers = await userModel.countDocuments();

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
        percentage: {
          $multiply: [{ $divide: ["$count", totalUsers] }, 100]
        }
      }
    },
    {
      $sort: { count: -1 } 
    },
  ]);
  // results= await userModel.populate(results, {
  //   path: "_id",
  //   model: "userType",
  //   select: "name", 
  // });
  if(!results){
    return res.status(404).json({
      message: "No Dashboard was found!",
    })
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateDashboard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedDashboard = await DashboardCodeModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedDashboard) {
    return res.status(404).json({ message: "Dashboard not found!" });
  }
  res.status(200).json({
    message: "Dashboard updated successfully!",
    updatedDashboard,
  });
});
const getActiveProjects= catchAsync(async (req, res, next) => {
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
      message: "No Project was found!",
    });
  }

  res.json({
    message: "Done",
    results,
  });
});
const getActiveProjectsByUser= catchAsync(async (req, res, next) => {
  let id =new mongoose.Types.ObjectId(req.params.id)
  
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: "User not found!" });
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
      message: "No Project was found!",
    });
  }

  res.json({
    message: "Done",
    results,
  });
});

const getProjectPerformance = catchAsync(async (req, res, next) => {
  let totalProjects = await projectModel.countDocuments(); // Get the total number of projects

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
      message: "No Dashboard was found!",
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
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: "User not found!" });
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
      message: "No Dashboard was found!",
    })
  }
  res.json({
    message: "Done",
    results,
  });
});


const weeklyActivity = catchAsync(async (req, res, next) => {
//   let id =new mongoose.Types.ObjectId(req.params.id)
// let check = await userModel.findById(id);
// if (!check) { 
//   return res.status(404).json({ message: "User not found!" });
// }
const weeklyActivity = await taskModel.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    }
  },
  {
    $group: {
      _id: {
        dayOfWeek: { $dayOfWeek: "$createdAt" }, // Group by day of the week
        taskStatus: "$taskStatus" 
      },
      count: { $sum: 1 } 
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

let results = weeklyActivity.map(item => {
  const data = {
    day: item._id, // Day of the week (1 = Sunday, 2 = Monday, etc.)
    delayed: 0,
    working: 0,
    completed: 0
  };
  
  item.statuses.forEach(status => {
    if (status.taskStatus === 'delayed') data.delayed = status.count;
    if (status.taskStatus === 'working') data.working = status.count;
    if (status.taskStatus === 'completed') data.completed = status.count;
  });
  
  return data;
});

  if(!results){
    return res.status(404).json({
      message: "No Dashboard was found!",
    })
  }
  res.json({
    message: "Done",
    results,
  });
});
const weeklyActivityByUser = catchAsync(async (req, res, next) => {
  let id =new mongoose.Types.ObjectId(req.params.id)
let check = await userModel.findById(id);
if (!check) { 
  return res.status(404).json({ message: "User not found!" });
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
        dayOfWeek: { $dayOfWeek: "$createdAt" }, // Group by day of the week
        taskStatus: "$taskStatus" 
      },
      count: { $sum: 1 } 
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

let results = weeklyActivity.map(item => {
  const data = {
    day: item._id, // Day of the week (1 = Sunday, 2 = Monday, etc.)
    delayed: 0,
    working: 0,
    completed: 0
  };
  
  item.statuses.forEach(status => {
    if (status.taskStatus === 'delayed') data.delayed = status.count;
    if (status.taskStatus === 'working') data.working = status.count;
    if (status.taskStatus === 'completed') data.completed = status.count;
  });
  
  return data;
});

  if(!results){
    return res.status(404).json({
      message: "No Dashboard was found!",
    })
  }
  res.json({
    message: "Done",
    results,
  });
});


export {  getAllDashboard, updateDashboard,getTopCountries ,getUserRatioPieChart ,getActiveProjects,getProjectPerformance ,getActiveProjectsByUser,getProjectPerformanceByUser,
  weeklyActivity ,weeklyActivityByUser
 };
