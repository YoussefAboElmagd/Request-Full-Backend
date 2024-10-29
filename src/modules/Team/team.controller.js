import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { teamModel } from "../../../database/models/team.model.js";
import { userModel } from "../../../database/models/user.model.js";
import { userGroupModel } from "../../../database/models/userGroups.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import bcrypt from "bcrypt";

const createTeam = catchAsync(async (req, res, next) => {
  req.body.model = "66e5611c1771cb44cd6fc7de";
  const newTeam = new teamModel(req.body);
  const savedTeam = await newTeam;
  savedTeam.members.push(savedTeam.createdBy);
  await savedTeam.save();
  res.status(201).json({
    message: "Team created successfully!",
    savedTeam,
  });
});

const getAllTeamByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(teamModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Team was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllTeamByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    teamModel.find({
      $or: [{ createdBy: req.params.id }, { members: req.params.id }],
    }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Team was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const getTeamById = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    teamModel.find({ _id: req.params.id }),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Team was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getTeamCount = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    teamModel.find({ createdBy: req.params.id }).select("members"),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Team was found!",
    });
  }
  results = results.length;
  res.json({
    message: "Done",
    results,
  });
});
const delegteTeamAccess = catchAsync(async (req, res, next) => {
  try {
    const team = await teamModel
      .findById(req.params.id)
      .populate({
        path: "members",
        select: "name email phone vocation projects role profilePic userGroups",
        populate: [
          {
            path: "projects",
            select: "name",
          },
          {
            path: "userGroups",
            select: "name",
          },
        ],
      })
      .exec();

    const groupedMembers = team.members.reduce((acc, member) => {
      member.projects.forEach((project) => {
        if (!acc[project._id]) {
          acc[project._id] = {
            projectName: project.name,
            projectId: project._id,
            members: [],
          };
        }

        const userGroupNames =
          member.userGroups.map((group) => group.name).join(", ") || "None";

        acc[project._id].members.push({
          _id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          vocation: member.vocation,
          access: userGroupNames,
          profilePic: member.profilePic,
        });
      });
      return acc;
    }, {});

    const results = Object.values(groupedMembers);

    res.json({
      message: "Success",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching team members",
      error: error.message,
    });
  }
});

const DeleteUserFromProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { project } = req.body;
  project =   new mongoose.Types.ObjectId(project);
let check = await projectModel.findById(project);
if (!check) {
  return res.status(404).json({ message: "Project not found!" });
}
let updateProject = await projectModel.findByIdAndUpdate(
  project,
  { $pull: { members: id } },
  { new: true }
);

let UpdateTasks = await projectModel.findById(project).select("tasks");
if (UpdateTasks) {
  UpdateTasks.tasks.forEach(async (task) => {
    await taskModel.findByIdAndUpdate(task, { $pull: { assignees: id } },
      { new: true });
  });
}  
  const updateeUser = await userModel.findByIdAndUpdate(
    id,
    { $pull: { projects: project} },
    { new: true }
  );
  if (!updateeUser) {
    return res.status(404).json({ message: "User not found!" });
  }
  res.status(200).json({
    message: "User Updated successfully!",
    updateeUser,
  });
});

const updateTeam = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { vocation, projects, name, email, password, access,tags,phone ,role } = req.body;
  let existUser = await userModel.findOne({ email: email });
  let existPhone = await userModel.findOne({ phone });
  if (existUser || existPhone) {
    return res.status(404).json({ message: "Email or Phone already exist!" });
  } else {
    password = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
    let model = "66ba00b0e39d9694110fd3df";
    let newUser = new userModel({
      name,
      email,
      password,
      vocation,
      projects,
      model,
      phone,
      role,
      tags,
      access,
    });
    const savedUser = await newUser.save();
    const updateeTeam = await teamModel.findByIdAndUpdate(
      id,
      { $push: { members: savedUser._id } },
      { new: true }
    );
    // const updateUserGroup = await userGroupModel.findByIdAndUpdate(
    //   access,
    //   { $push: { users: savedUser._id } },
    //   { new: true }
    // );

    let addprojects = Array.isArray(projects) ? projects : [projects];
    addprojects.forEach(async (project) => {
      await projectModel.findByIdAndUpdate(
        project,
        {
          $push: { members: savedUser._id },
        },
        { new: true }
      );
    });

    if (!updateeTeam) {
      return res.status(404).json({ message: "Team not found!" });
    }
    res.status(200).json({
      message: "Team Updated successfully!",
      updateeTeam,
    });
  }
});
const updateTeamMembers = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { members } = req.body;
  const updateeTeam = await teamModel.findByIdAndUpdate(
    id,
    { $pull: { members } },
    { new: true }
  );
  if (!updateeTeam) {
    return res.status(404).json({ message: "Team not found!" });
  }
  res.status(200).json({
    message: "Team Updated successfully!",
    updateeTeam,
  });
});

// const findUserEmail = catchAsync(async (req, res, next) => {
//   let existUser = await userModel.findOne({ email: req.body.email }).select(
//     "email name "
//   );
//   if (!existUser) {
//     return res.status(404).json({ message: "user not found!" });
//   }
//   res.status(200).json({
//     message: "Done",
//     existUser,
//   });
// });
const deleteTeam = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteTeam = await teamModel.findByIdAndDelete(id);
  if (!deleteTeam) {
    return res.status(404).json({ message: "Team not found!" });
  }
  res.status(200).json({
    message: "Team Deleted successfully!",
    deleteTeam,
  });
});

export {
  createTeam,
  getAllTeamByAdmin,
  updateTeam,
  deleteTeam,
  // findUserEmail,
  getAllTeamByUser,
  getTeamById,
  updateTeamMembers,
  delegteTeamAccess,
  DeleteUserFromProject,
  getTeamCount,
};
