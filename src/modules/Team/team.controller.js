import { teamModel } from "../../../database/models/team.model.js";
import { userModel } from "../../../database/models/user.model.js";
import { userTypeModel } from "../../../database/models/userType.model.js";
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

const updateTeam = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let {  jobTitle, rights, name, email, password } = req.body;
  let existUser = await userModel.findOne({ email: email });
  if (existUser) {
    return res.status(404).json({ message: "Email already exist!" });
  } else {
    password = bcrypt.hashSync(password, Number(process.env.SALTED_VALUE));
    let newUser = new userModel({ name, email, password });
    const savedUser = await newUser.save();
    let accesrights = new userTypeModel({ jobTitle, rights });
    const savedRights = await accesrights.save();
    await userModel.findByIdAndUpdate(
      savedUser._id,
      { role: savedRights._id },
      { new: true }
    );
    const updateeTeam = await teamModel.findByIdAndUpdate(
      id,
      { $push: { members: savedUser._id },  },
      { new: true }
    );
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
};
