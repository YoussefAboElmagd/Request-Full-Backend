import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { userModel } from "../../../database/models/user.model.js";
import generateUniqueId from "generate-unique-id";
import { sendEmail } from "../../email/sendEmail.js";
import { teamModel } from "../../../database/models/team.model.js";

export const signUp = catchAsync(async (req, res, next) => {
  // let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (req.body.phone === "" && req.body.phone.length < 10) {
    return res.status(409).json({ message: "this phone is not valid" });
  }
  if (req.body.email !== "") {
    let existUser = await userModel.findOne({ phone: req.body.phone });
    let existUser2 = await userModel.findOne({ email: req.body.email });
    if (existUser) {
      return res.status(409).json({ message: "this phone  already exist" });
    }
    if (existUser2) {
      return res.status(409).json({ message: "this email  already exist" });
    }
  } else {
    return res.status(409).json({ message: "this  email is not valid" });
  }

  req.body.model = "66ba00b0e39d9694110fd3df";
  req.body.isSuperUser = true;
  req.body.profilePic = "http://62.72.32.44:8000/profilePic/profile.png";
  req.body.verificationCode = generateUniqueId({
    length: 4,
    useLetters: false,
  });
  req.body.password = bcrypt.hashSync(
    req.body.password,
    Number(process.env.SALTED_VALUE)
  );
  let results = new userModel(req.body);
  let token = jwt.sign(
    { name: results.name, userId: results._id },
    process.env.JWT_SECRET_KEY
  );
  sendEmail(results.email, results.verificationCode);
  let model = "66e5611c1771cb44cd6fc7de";
  let createdBy = results._id;
  const newTeam = new teamModel({createdBy , model});
  const savedTeam = await newTeam;
  savedTeam.members.push(savedTeam.createdBy);
  results.team = savedTeam._id
  await savedTeam.save();
  await results.save();
  await results.populate("role");
  res.json({ message: "added", token, results ,savedTeam });
});

// export const signIn = catchAsync(async (req, res, next) => {
//   // let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
//   let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
//   if (
//     req.body.email !== "" &&
//     req.body.email.match(emailFormat) &&
//     req.body.phone !== ""
//     // req.body.phone.match(phoneFormat)
//   ) {
//     // if (req.body.phone !== "") {
//     let { phone } = req.body.phone;
//     let userData = await userModel.findOne({ phone });
//     if (!userData) return res.status(404).json({ message: "User Not Found" });
//     if (userData) {
//       let token = jwt.sign(
//         { name: userData.name, userId: userData._id },
//         process.env.JWT_SECRET_KEY
//       );
//       return res.json({ message: "success", token, userData });
//     }
//     return res.status(401).json({ message: "worng phone " });
//   } else {
//     return res.status(409).json({ message: "this phone is not valid" });
//   }
// });

export const signIn = catchAsync(async (req, res, next) => {
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (req.body.email !== "" && req.body.email.match(emailFormat)) {
    let { email, password } = req.body;
    let userData = await userModel.findOne({ email });
    if (!userData)
      return res.status(401).json({ message: "worng email or password" });
    const match = bcrypt.compareSync(password, userData.password);
    if (match && userData) {
      userData.verificationCode = generateUniqueId({
        length: 4,
        useLetters: false,
      });
      sendEmail(userData.email, userData.verificationCode);
      await userData.save();
      let token = jwt.sign(
        { name: userData.name, userId: userData._id },
        process.env.JWT_SECRET_KEY
      );
      return res.json({ message: "success", token, userData });
    }
    return res.status(401).json({ message: "worng email or password" });
  } else {
    return res.status(409).json({ message: "this email is not valid" });
  }
});

export const resend = catchAsync(async (req, res, next) => {
  if (req.body.email !== "") {
    let { email } = req.body;
    let userData = await userModel.findOne({ email });
    if (!userData)
      return res.status(401).json({ message: "worng email or password" });
    if (userData) {
      userData.verificationCode = generateUniqueId({
        length: 4,
        useLetters: false,
      });
      sendEmail(userData.email, userData.verificationCode);
      await userData.save();
      let token = jwt.sign(
        { name: userData.name, userId: userData._id },
        process.env.JWT_SECRET_KEY
      );
      let verificationCode = userData.verificationCode;
      return res.json({
        message: "success",
        verificationCode,
        userData,
        token,
      });
    }
    return res.status(401).json({ message: "worng email " });
  } else {
    return res.status(409).json({ message: "this email is not valid" });
  }
});
export const forgetPassword = catchAsync(async (req, res, next) => {
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (req.body.email !== "" && req.body.email.match(emailFormat)) {
    let { email } = req.body;
    let userData = await userModel.findOne({ email });
    if (!userData) return res.status(404).json({ message: "Email Not Found" });
    userData.verificationCode = generateUniqueId({
      length: 4,
      useLetters: false,
    });
    sendEmail(userData.email, userData.verificationCode);
    await userData.save();
    let verificationCode = userData.verificationCode;
    let id = userData._id;
    return res.json({ message: "Verification Code", verificationCode, id });
  } else {
    return res.status(409).json({ message: "this email is not valid" });
  }
});

// 1- check we have token or not
// 2- verfy token
// 3 if user of this token exist or not
// 4- check if this token is the last one or not (change password )

export const protectRoutes = catchAsync(async (req, res, next) => {
  let { token } = req.headers;
  if (!token) {
    return next(new AppError(`please login first`, 401));
  }
  let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  let user = await userModel.findById(decoded.userId);
  if (!user) {
    return next(new AppError(`user Invalid`, 401));
  }
  if (user.changePasswordAt) {
    let changePasswordTime = parseInt(user.changePasswordAt.getTime() / 1000);
    if (changePasswordTime > decoded.iat) {
      return next(new AppError(`token Invalid`, 401));
    }
  }
  req.user = user;
  next();
});

export const allowTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        res.status(403).json({ message: "you don't have permission" })
      );
    }
    next();
  };
};
