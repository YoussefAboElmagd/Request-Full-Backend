import { projectModel } from "../../../database/models/project.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

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


export {  getAllDashboard, updateDashboard,getTopCountries ,getUserRatioPieChart ,getActiveProjects,getProjectPerformance };
