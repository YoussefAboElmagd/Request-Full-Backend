import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { DateTime } from "luxon";
import { photoUpload } from "../../utils/removeFiles.js";
import { contactUs, contactUs2, sendInvite } from "../../email/sendEmail.js";
import cron from "node-cron";

const updateprofilePic = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let check = await userModel.findById(id);
  let err_1 = "User not found!"
  if(req.query.lang == "ar"){
    err_1 = "المستخدم غير موجود"  
  }
if (!check) { 
  return res.status(404).json({ message: err_1 });
}
  const profilePic = photoUpload(req, "profilePic", "profilePic");

  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { profilePic: profilePic },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: err_1 });
  }
  res.status(200).json({ message: "Profile updated successfully!", profilePic });
});


const postMessage = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel.findById(id);
  let err_1 = "couldn't post! user not found!"
  let message = "Message sent to admin"
  if(req.query.lang == "ar"){
    err_1 = "لا يمكن إرسال الرسالة! المستخدم غير موجود!"
    message = "تم إرسال الرسالة إلى المسؤول"
  }
  !user && res.status(404).json({ message: "couldn't post! user not found!" });
  contactUs( user.name,user.email,req.body.message);
  res.json({ message: message, user });
});
const getInTouch = catchAsync(async (req, res, next) => {
  let err_1 = "This Phone is not valid"
  let err_2 = "This Email is not valid"
  let message = "Message sent to admin"
  if(req.query.lang == "ar"){
    err_1 = "هذا الهاتف غير صحيح"
    err_2 = "هذا البريد الالكتروني غير صحيح"
    message = "تم إرسال الرسالة إلى المسؤول"
  }
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (req.body.phone === "" || req.body.phone.length < 9) {
    return res.status(409).json({ message: err_1 });
  }
  if (req.body.email !== "" && req.body.email.match(emailFormat)) {
    contactUs2( req.body.name,req.body.email,req.body.phone,req.body.message);
    res.json({ message: message});
  }else{
    return res.status(409).json({ message: err_2 });
  }
});

const sendInviteToProject = catchAsync(async (req, res, next) => {
  let link = "http://62.72.32.44:4005/SignUp/ChooseRole"
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  let err_2 = "This Email is not valid"
  let message = "Invite has been sent!"
  if(req.query.lang == "ar"){
    err_2 = "هذا البريد الالكتروني غير صحيح"
    message = "تم إرسال الرسالة  "
  }
  if (req.body.email === "" || req.body.email.match(emailFormat)) {
    return res.status(409).json({ message: err_2 });
  }
  isFound = await userModel.findOne({ email: req.body.email });
  if (isFound) {
    sendInvite(req.body.email , link);
    return res.json({
      message: message,
    })

  }else{

    sendInvite(req.body.email , link);
    return res.json({
      message: message,
    })
  }
})
const updateCollection = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let check = await userModel.findById(id);
  let err_1 = "User not found!"
  let err_2 = "Couldn't update!  not found!"
  let message = "Company Files updated successfully!"
  if(req.query.lang == "ar"){
    err_1 = "المستخدم غير موجود"
    err_2 = "لا يمكن تحديث هذا المستخدم!"
    message = "تم تحديث ملفات الشركة بنجاح!"
  }
  if (!check) { 
    return res.status(404).json({ message: err_1 });
  }
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
    return res.status(404).json({ message: err_2 });
  }
  res.status(200).json({ message: message, updates});
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find().limit(5).sort({ $natural: -1 }), req.query).search();
  let message = "No users was found! add a new user to get started!"
  if(req.query.lang == "ar"){
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!"
  }
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
  let message = "No users was found! add a new user to get started!"
  if(req.query.lang == "ar"){
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!"
  }
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
      message: message,
    });
  }
});
const getAllcontractors = catchAsync(async (req, res, next) => {
  let message = "No users was found! add a new user to get started!"
  if(req.query.lang == "ar"){
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!"
  }
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
      message: message,
    });
  }
});
const getAllconsultant = catchAsync(async (req, res, next) => {
  let message = "No users was found! add a new user to get started!"
  if(req.query.lang == "ar"){
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!"
  }
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
      message: message,
    });
  }
});

const getUserById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found"
  if(req.query.lang == "ar"){
    message = "المستخدم غير موجود"
  }
  let results = await userModel.findById(id);
  !results && next(new AppError(message, 404));
  let lastSignIn = req.lastSignIn
  results && res.json({ message: "Done", results,lastSignIn });
});
const getUserCompanyDetails = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found"
  if(req.query.lang == "ar"){
    message = "المستخدم غير موجود"
  }
  let results = await userModel.findById(id).select("companyName companyLogo signature electronicStamp");
  !results && next(new AppError(message, 404));
  results && res.json({ message: "Done", results, });
});
const getUserTags = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found"
  if(req.query.lang == "ar"){
    message = "المستخدم غير موجود"
  }
  let results = await userModel.findById(id).select("tags");
  !results && next(new AppError(message, 404));
  results = results.tags;
  results && res.json({ message: "Done", results });
});
const getUserByEmail = catchAsync(async (req, res, next) => {
  let message = "Email Not found"
  if(req.query.lang == "ar"){
    message = "البريد الإلكتروني غير موجود"
  }
  let results = await userModel.find({email: req.body.email});
  !results && next(new AppError(message, 404));
  results = results.tags;
  results && res.json({ message: "Done", results });
});

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't update! not found!"
  if(req.query.lang == "ar"){
    err = "لا يمكن التحديث! المستخدم غير موجود"
  }
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
    twoWayAuthentication,
    notifications,
    renewalSubscription,
    userGroups,
    access,
    plan
  } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $push: { projects, tags ,userGroups},
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
      twoWayAuthentication,
      access,
      plan
    },
    { new: true }
  );
  !results && res.status(404).json({ message: err });
  results && res.json({ message: "user updated successfully", results });
});

const getSubscriptionPeriod = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found"
  if(req.query.lang == "ar"){
    message = "المستخدم غير موجود"
  }
  let result = await userModel.findById(id);
  !result && next(new AppError(message, 404));
  let today = new Date();
  const timeDiff = result.trialEndDate - today;
  let remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const results = {
    subscriptionType: result.subscriptionType,
    isTrialActive: result.isTrialActive,
    trialStartDate: result.trialStartDate,
    trialEndDate: result.trialEndDate,
    remainingDays: remainingDays,
};
results && res.json({ message: "Done", results });
today.setMinutes(today.getMinutes() + 1);

  const cronExpression = `${today.getMinutes()} ${today.getHours()} * * *`;
  
  const task = cron.schedule(cronExpression, async () => {
    try {
      console.log(remainingDays,"remaining Days");
      if(remainingDays <= 0){
      let user =  await userModel.findByIdAndUpdate(id, {
          isTrialActive: false,
          isOnFreeTrial: false,
          trialEndDate: new Date(),
          subscriptionType: "normal",
        },{new: true});
        console.log(user,"user");
      }
      
      task.stop();
    } catch (error) {
      console.error("Error during cron job execution:", error);
    }
  });
});

const updateUser2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let { projects, tags ,userGroups } = req.body;
  let err = "couldn't update! not found!"
  if(req.query.lang == "ar"){
    err = "لا يمكن التحديث! المستخدم غير موجود"
  }
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $pull: { projects, tags ,userGroups },
    },
    { new: true }
  );
  !results && res.status(404).json({ message: err });
  results && res.json({ message: "user updated successfully", results });
});

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't Delete! not found!"
  if(req.query.lang == "ar"){
    err = "لا يمكن المسح! المستخدم غير موجود"
  }
  let deletedUser = await userModel.deleteOne({ _id: id });

  if (!deletedUser) {
    return res
      .status(404)
      .json({ message: err });
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
  getInTouch,
  sendInviteToProject,
  getUserByEmail,
  getSubscriptionPeriod,
  getUserCompanyDetails,
};
