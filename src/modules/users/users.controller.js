import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { DateTime } from "luxon";
import { photoUpload } from "../../utils/removeFiles.js";
import { contactUs } from "../../email/sendEmail.js";

const updateprofilePic = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const profilePic = photoUpload(req, "profilePic", "profilePic");

  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { profilePic: profilePic },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!", profilePic });
});


const postMessage = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel.findById(id);
  !user && res.status(404).json({ message: "couldn't post! not found!" });
  contactUs( user.name,user.email,req.body.message);
  res.json({ message: "Message sent to admin", user });
});

const updateCollection = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  const updates = {};
  const companyLogo = photoUpload(req, "companyLogo", "company");
  const electronicStamp = photoUpload(req, "electronicStamp", "company");
  const signature = photoUpload(req, "signature", "company");
  
  if (signature) updates.signature = signature;
  if (companyLogo) updates.companyLogo = companyLogo;
  if (electronicStamp) updates.electronicStamp = electronicStamp;
  if(req.body.companyName){
    updates.companyName = req.body.companyName
  }
  if (Object.keys(updates).length > 0) {
    const updatedProfile = await userModel.findByIdAndUpdate(id, updates, { new: true });
  }
  else{
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Company Files updated successfully!", updates});
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find().limit(5).sort({ $natural: -1 }), req.query).search();

  let results = await ApiFeat.mongooseQuery;
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
  res.json({
    message: "Done",

    count: await userModel.countDocuments(),
    results,
  });
});
const getAllowners = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find({ role: "66d33a4b4ad80e468f231f83" }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "66d33a4b4ad80e468f231f83" }),
    results,
  });
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
});
const getAllcontractors = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find({ role: "66d33ec44ad80e468f231f91" }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "66d33ec44ad80e468f231f91" }),
    results,
  });
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
});
const getAllconsultant = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find({ role: "66d33e7a4ad80e468f231f8d" }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "66d33e7a4ad80e468f231f8d" }),
    results,
  });
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
});

const getUserById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await userModel.findById(id);
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "Done", results });
});
const getUserTags = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await userModel.findById(id).select("tags");
  !results && next(new AppError(`not found `, 404));
  results = results.tags;
  results && res.json({ message: "Done", results });
});

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.dateOfBirth) {
    req.body.dateOfBirth = DateTime.fromISO(req.body.dateOfBirth).toISODate();
  }
  let {
    name,
    phone,
    password,
    dateOfBirth,
    role,
    projects,
    profilePic,
    verificationCode,
    tags,
    otp,
    confirmedPhone,
    presentAddress,
    city,
    country,
    postalCode,
    verified,
    userType,
    companyName,
    vocation,
    offersAndPackages,
    notifications,
    renewalSubscription,
  } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $push: { projects, tags },
      name,
      phone,
      password,
      dateOfBirth,
      role,
      otp,
      profilePic,
      verificationCode,
      confirmedPhone,
      presentAddress,
      city,
      country,
      postalCode,
      verified,
      userType,
      companyName,
      vocation,
      offersAndPackages,
      notifications,
      renewalSubscription,
    },
    { new: true }
  );
  !results && res.status(404).json({ message: "couldn't update! not found!" });
  results && res.json({ message: "updatedd", results });
});
const updateUser2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let { projects, tags } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $pull: { projects, tags },
    },
    { new: true }
  );
  !results && res.status(404).json({ message: "couldn't update! not found!" });
  results && res.json({ message: "updatedd", results });
});

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedUser = await userModel.deleteOne({ _id: id });

  if (!deletedUser) {
    return res
      .status(404)
      .json({ message: "Couldn't delete! User not found!" });
  }

  res.status(200).json({ message: "User deleted successfully!" });
});

export {
  getAllUsersByAdmin,
  getUserById,
  updateUser,
  updateUser2,
  deleteUser,
  getAllowners,
  getAllcontractors,
  getAllconsultant,
  updateCollection,
  updateprofilePic,
  getUserTags,
  postMessage,
};
