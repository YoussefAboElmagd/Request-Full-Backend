import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import path from "path";
import fsExtra from "fs-extra";
import { DateTime } from "luxon";

const updateprofilePic = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let profilePic = "";
  if (req.files.profilePic) {
    req.body.profilePic =
      req.files.profilePic &&
      req.files.profilePic.map(
        (file) =>
          `http://62.72.32.44:8000/profilePic/${file.filename
            .split(" ")
            .join("-")}`
      );
    const directoryPath = path.join(profilePic, "uploads/profilePic");

    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    if (req.body.profilePic !== "") {
      profilePic = req.body.profilePic;
      profilePic = profilePic[0];
    }
  }

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
const updateIdPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let idPhoto = "";
  if (req.files.idPhoto) {
    req.body.idPhoto =
      req.files.idPhoto &&
      req.files.idPhoto.map(
        (file) =>
          `http://62.72.32.44:8000/idPhoto/${file.filename
            .split(" ")
            .join("-")}`
      );
    const directoryPath = path.join(idPhoto, "uploads/photos");

    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    if (req.body.idPhoto !== "") {
      idPhoto = req.body.idPhoto;
    }
  }
  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { idPhoto: idPhoto },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!", idPhoto });
});
const addIdPhotos = catchAsync(async (req, res, next) => {
  let idPhoto = "";
  console.log(req.body, "req.body");
  console.log(req.file, "req.fiiles");
  console.log(req.files, "req.fiiles");

  req.body.idPhoto =
    req.files.idPhoto &&
    req.files.idPhoto.map(
      (file) =>
        `http://62.72.32.44:8000/ids/${file.filename.split(" ").join("-")}`
    );

  const directoryPath = path.join(idPhoto, "uploads/photos");

  fsExtra.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }
    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.idPhoto) {
    idPhoto = req.body.idPhoto;
  }
  if (idPhoto !== "") {
    let updatedProfile = await userModel.findByIdAndUpdate(
      req.params.id,
      { idPhoto: idPhoto },
      { new: true }
    );
    res.status(200).json({
      message: "Photo created successfully!",
      idPhoto,
    });
  } else {
    res.status(400).json({ message: "File upload failed." });
  }
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find(), req.query).sort().search();

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
  let ApiFeat = new ApiFeature(userModel.find({ role: "owner" }), req.query)
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "owner" }),
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
    userModel.find({ role: "contractor" }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "contractor" }),
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
    userModel.find({ role: "consultant" }),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "Done",

    count: await userModel.countDocuments({ role: "consultant" }),
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

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.dateOfBirth) {
    req.body.dateOfBirth = DateTime.fromISO(req.body.dateOfBirth).toISODate();
  }
  let {
    name,
    phone,
    email,
    password,
    dateOfBirth,
    idPhoto,
    role,
    projects,
    profilePic,
    verificationCode,
    tags,
    otp,
    confirmedPhone,
    presentaddress,
    city,
    country,
    postalCode,
    idNumber,
    expiryIdNumber,
    verified,
  } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $push: { projects, tags },
      name,
      phone,
      email,
      password,
      dateOfBirth,
      idPhoto,
      role,
      otp,
      profilePic,
      verificationCode,
      confirmedPhone,
      presentaddress,
      city,
      country,
      postalCode,
      idNumber,
      expiryIdNumber,
      verified,
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
  deleteUser,
  getAllowners,
  getAllcontractors,
  getAllconsultant,
  addIdPhotos,
  updateprofilePic,
  updateIdPhoto,
};
