import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { userModel } from "../../../database/models/user.model.js";
import generateUniqueId from "generate-unique-id";

export const signUp = catchAsync(async (req, res, next) => {
  let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (
    req.body.email !== "" &&
    req.body.email.match(emailFormat)&&
    req.body.phone !== "" &&
    req.body.phone.match(phoneFormat) &&
    req.body.phone.length > 10
  ) {
    let existUser = await userModel.findOne({ phone: req.body.phone });
    if (existUser) {
      return res.status(409).json({ message: "this phone already exist" });
    }
  } else {
    return res.status(409).json({ message: "this phone is not valid" });
  }
  let results = new userModel(req.body);
  let token = jwt.sign(
    { name: results.name, userId: results._id },
    process.env.JWT_SECRET_KEY
  );
  await results.save();
  res.json({ message: "added", token, results });
});

export const signIn = catchAsync(async (req, res, next) => {
  let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (
    req.body.email !== "" &&
    req.body.email.match(emailFormat)&&
    req.body.phone !== "" && req.body.phone.match(phoneFormat)) {
  // if (req.body.phone !== "") {
    let { phone } = req.body.phone;
    let isFound = await userModel.findOne({ phone });
    if (!isFound) return res.status(404).json({ message: "User Not Found" });
    if (isFound) {
      let token = jwt.sign(
        { name: isFound.name, userId: isFound._id },
        process.env.JWT_SECRET_KEY
      );
      return res.json({ message: "success", token, isFound });
    }
    return res.status(401).json({ message: "worng phone " });
  } else {
    return res.status(409).json({ message: "this phone is not valid" });
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
      return next(res.status(403).json({ message: "you don't have permission" }));
    }
    next();
  };
};
