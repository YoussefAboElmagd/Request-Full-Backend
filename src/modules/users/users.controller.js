import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { DateTime } from "luxon";
import { photoUpload } from "../../utils/removeFiles.js";
import { contactUs, contactUs2, sendInvite } from "../../email/sendEmail.js";
import cron from "node-cron";
import { invitationModel } from "../../../database/models/invitation.model.js";
import { userTypeModel } from "../../../database/models/userType.model.js";
import { projectModel } from "../../../database/models/project.model.js";
import { sendNotification } from "../../utils/sendNotification.js";

const updateprofilePic = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let check = await userModel.findById(id);
  let err_1 = "User not found!";
  if (req.query.lang == "ar") {
    err_1 = "المستخدم غير موجود";
  }
  if (!check) {
    return res.status(404).json({ message: err_1 });
  }
  let profilePic = photoUpload(req, "profilePic", "profilePic");
  profilePic = profilePic.replace(`https://api.request-sa.com/`, "");

  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { profilePic: profilePic },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: err_1 });
  }
  res
    .status(200)
    .json({ message: "Profile updated successfully!", profilePic });
});

const postMessage = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel.findById(id);
  let err_1 = "couldn't post! user not found!";
  let message = "Message sent to admin";
  if (req.query.lang == "ar") {
    err_1 = "لا يمكن إرسال الرسالة! المستخدم غير موجود!";
    message = "تم إرسال الرسالة إلى المسؤول";
  }
  !user && res.status(404).json({ message: "couldn't post! user not found!" });
  contactUs(user.name, user.email, req.body.message,user._id);
  res.json({ message: message, user });
});
const getInTouch = catchAsync(async (req, res, next) => {
  let err_1 = "This Phone is not valid";
  let err_2 = "This Email is not valid";
  let message = "Message sent to admin";
  if (req.query.lang == "ar") {
    err_1 = "هذا الهاتف غير صحيح";
    err_2 = "هذا البريد الالكتروني غير صحيح";
    message = "تم إرسال الرسالة إلى المسؤول";
  }
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (req.body.phone === "" || req.body.phone.length < 9) {
    return res.status(409).json({ message: err_1 });
  }
  if (req.body.email !== "" && req.body.email.match(emailFormat)) {
    contactUs2(req.body.name, req.body.email, req.body.phone, req.body.message,req.user._id);
    res.json({ message: message });
  } else {
    return res.status(409).json({ message: err_2 });
  }
});

const sendInviteToProject = catchAsync(async (req, res, next) => {
  let link = "https://request-sa.com/Invitation";
  let invitations = Array.isArray(req.body) ? req.body : [req.body];
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  let err_2 = "This Email is not valid";
  let err_1 = "Project not found!";
  let message = "Invite has been sent!";
  if (req.query.lang == "ar") {
    err_2 = "هذا البريد الالكتروني غير صحيح";
    err_1 = "المشروع غير موجود";
    message = "تم إرسال الدعوة  ";
  }
  for (let invitation of invitations) {
    if (invitation.email === "" || !invitation.email.match(emailFormat)) {
      return res
        .status(409)
        .json({ message: `${invitation.email}  ${err_2}.` });
    }
    try {
      let isFound = await userModel.findOne({ email: invitation.email });
      let roleName = await userTypeModel
        .findOne({ _id: invitation.role })
        .select("jobTitle");
      let project = await projectModel
        .findOne({ _id: invitation.project })
        .select("name");
        if(!project){
          return res.status(404).json({ message: err_1 });
        }
      let addedInvitations = new invitationModel(invitation);
      let savedData = await addedInvitations.save();

      sendInvite(
        invitation,
        project.name,
        roleName.jobTitle,
        savedData._id,
        link
      );
      if (isFound) {
        await invitationModel.findByIdAndUpdate(
          savedData._id,
          { isSignUp: true },
          { new: true }
        );
        let message_en = `You have been invited to join ${project.name} as ${roleName.jobTitle}`
        let message_ar = `لقد تم دعوتك للانضمام إلى ${project.name} ك ${roleName.jobTitle}`
        sendNotification(message_en,message_ar,"warning",isFound._id,invitation)
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred.", error: error.message });
    }
  }
  return res.json({
    message: message,
  });
});
const updateInvite = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let check = await invitationModel.findById(id);
  let err_1 = "Ivitation not found!";
  let err_2 = "Ivitation not vaild!";
  let err_3 = "User not found!";
  // let err_4 = "Your role is not correct like Invitation!";
  if (req.query.lang == "ar") {
    err_1 = "الدعوة غير موجودة";
    err_2 = "الدعوة غير صالحة";
    err_3 = "المستخدم غير موجود";
    // err_4 = "دورك غير صحيح مثل الدعوة!"
  }
  if (!check) {
    return res.status(404).json({ message: err_1 });
  }
  if (req.body.isApproved == true) {
    let foundUser = await userModel.findOne({ email: check.email });
    if (foundUser) {
      let updates = {}
      let project = await projectModel.findById(check.project);
      if(check.role == "66d33e7a4ad80e468f231f8d" && project.consultant == null){ //consultant
        updates.consultant = foundUser._id
        updates.$push = { members: foundUser._id }
      }else{
        updates.$push = { members: foundUser._id }
      }
      if(check.role == "66d33ec44ad80e468f231f91" && project.contractor == null){ //contractor
        updates.contractor = foundUser._id
        updates.$push = { members: foundUser._id }
      }else{
        updates.$push = { members: foundUser._id }
      }

      await projectModel.findOneAndUpdate(
        { _id: check.project },
        updates,
        { new: true }
      );
      await invitationModel.deleteOne({ _id: id });
      return res.status(200).json({ message: "Done" });
    } else {
      return res.status(404).json({ message: err_3 });
    }
  } else {
    return res.status(404).json({ message: err_2 });
  }
});

const updateCollection = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let check = await userModel.findById(id);
  let err_1 = "User not found!";
  let err_2 = "Couldn't update!  not found!";
  let message = "Company Files updated successfully!";
  if (req.query.lang == "ar") {
    err_1 = "المستخدم غير موجود";
    err_2 = "لا يمكن تحديث هذا المستخدم!";
    message = "تم تحديث ملفات الشركة بنجاح!";
  }
  if (!check) {
    return res.status(404).json({ message: err_1 });
  }
  let updates = {};
  let companyLogo = photoUpload(req, "companyLogo", "company");
  let electronicStamp = photoUpload(req, "electronicStamp", "company");
  let signature = photoUpload(req, "signature", "company");

  if (signature) {
    signature = signature.replace(`https://api.request-sa.com/`, "");
    updates.signature = signature;
  }
  if (companyLogo)
    {
      companyLogo = companyLogo.replace(`https://api.request-sa.com/`, "");
      updates.companyLogo = companyLogo;
    }
  if (electronicStamp) {
    electronicStamp = electronicStamp.replace(`https://api.request-sa.com/`, "");
    updates.electronicStamp = electronicStamp;
  }
  if (req.body.companyName) {
    updates.companyName = req.body.companyName;
  }
  if (Object.keys(updates).length > 0) {
    const updatedProfile = await userModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
  } else {
    return res.status(404).json({ message: err_2 });
  }
  res.status(200).json({ message: message, updates });
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find().limit(10),
    req.query
  ).search();
  let message = "No users was found! add a new user to get started!";
  if (req.query.lang == "ar") {
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!";
  }
  let results = await ApiFeat.mongooseQuery;
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
  res.json({
    message: "Done",
    countAllUsers: await userModel.countDocuments(),
    countOwners: await userModel.countDocuments({ role: "66d33a4b4ad80e468f231f83" }),
    countContractors: await userModel.countDocuments({ role: "66d33ec44ad80e468f231f91" }),
    countConsultant: await userModel.countDocuments({ role: "66d33e7a4ad80e468f231f8d" }),
    results,
  });
});
const getAllNewUsers = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find().limit(10).sort({ $natural: -1 }),
    req.query
  ).search();
  let message = "No users was found! add a new user to get started!";
  if (req.query.lang == "ar") {
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!";
  }
  let results = await ApiFeat.mongooseQuery;
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllowners = catchAsync(async (req, res, next) => {
  let message = "No users was found! add a new user to get started!";
  if (req.query.lang == "ar") {
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!";
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
  let message = "No users was found! add a new user to get started!";
  if (req.query.lang == "ar") {
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!";
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
  let message = "No users was found! add a new user to get started!";
  if (req.query.lang == "ar") {
    message = "لا يوجد مستخدمين! أضف مستخدم جديد للبدء!";
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
  let message = "User Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
  }
  let results = await userModel.findById(id);
  !results && next(new AppError(message, 404));
  let lastSignIn = req.lastSignIn;
  results && res.json({ message: "Done", results, lastSignIn });
});
const getUserForInvite = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found";
  let message2 = "Invitation Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
    message2 = "الدعوة غير موجودة";
  }
  let results = await userModel.findById(id).select("name email");
  let data = await invitationModel
    .findById({ _id: req.query.id })
    .select("role project projectName isSignUp comment")
    .populate("role");
  if (!data) {
    return res.status(404).json({
      message: message2,
    });
  }
  !results && next(new AppError(message, 404));
  results = { ...results._doc, ...data._doc };
  results && res.json({ message: "Done", results });
});
const getUserCompanyDetails = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
  }
  let results = await userModel
    .findById(id)
    .select("companyName companyLogo signature electronicStamp");
  !results && next(new AppError(message, 404));
  results && res.json({ message: "Done", results });
});
const getUserTags = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
  }
  let results = await userModel.findById(id).select("tags");
  !results && next(new AppError(message, 404));
  results = results.tags;
  results && res.json({ message: "Done", results });
});
const getUserByEmail = catchAsync(async (req, res, next) => {
  let message = "Email Not found";
  if (req.query.lang == "ar") {
    message = "البريد الإلكتروني غير موجود";
  }
  let results = await userModel.find({ email: req.body.email });
  !results && next(new AppError(message, 404));
  results = results.tags;
  results && res.json({ message: "Done", results });
});

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't update! not found!";
  if (req.query.lang == "ar") {
    err = "لا يمكن التحديث! المستخدم غير موجود";
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
    plan,
  } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $push: { projects, tags, userGroups },
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
      plan,
    },
    { new: true }
  );
  !results && res.status(404).json({ message: err });
  results && res.json({ message: "user updated successfully", results });
});

const getSubscriptionPeriod = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
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
      console.log(remainingDays, "remaining Days");
      if (remainingDays <= 0) {
        let user = await userModel.findByIdAndUpdate(
          id,
          {
            isTrialActive: false,
            isOnFreeTrial: false,
            trialEndDate: new Date(),
            subscriptionType: "normal",
          },
          { new: true }
        );
        console.log(user, "user");
      }

      task.stop();
    } catch (error) {
      console.error("Error during cron job execution:", error);
    }
  });
});

const updateUser2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let { projects, tags, userGroups } = req.body;
  let err = "couldn't update! not found!";
  if (req.query.lang == "ar") {
    err = "لا يمكن التحديث! المستخدم غير موجود";
  }
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $pull: { projects, tags, userGroups },
    },
    { new: true }
  );
  !results && res.status(404).json({ message: err });
  results && res.json({ message: "user updated successfully", results });
});

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't Delete! not found!";
  if (req.query.lang == "ar") {
    err = "لا يمكن المسح! المستخدم غير موجود";
  }
  let deletedUser = await userModel.deleteOne({ _id: id });

  if (!deletedUser) {
    return res.status(404).json({ message: err });
  }

  res.status(200).json({ message: "User deleted successfully!" });
});
const deleteInvite = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't Delete! Invite not found!";
  if (req.query.lang == "ar") {
    err = "لا يمكن المسح! الدعوة غير موجود";
  }
  let deletedUser = await invitationModel.deleteOne({ _id: id });

  if (!deletedUser) {
    return res.status(404).json({ message: err });
  }

  res.status(200).json({ message: "invite deleted successfully!" });
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
  updateInvite,
  getUserForInvite,
  deleteInvite,
  getAllNewUsers,
};
