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
const updateStamp = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let electronicStamp = "";
  if (req.files.electronicStamp) {
    req.body.electronicStamp =
      req.files.electronicStamp &&
      req.files.electronicStamp.map(
        (file) =>
          `http://62.72.32.44:8000/stamp/${file.filename
            .split(" ")
            .join("-")}`
      );
    const directoryPath = path.join(electronicStamp, "uploads/stamp");

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

    if (req.body.electronicStamp !== "") {
      electronicStamp = req.body.electronicStamp;
      electronicStamp = electronicStamp[0];
    }
  }

  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { electronicStamp: electronicStamp },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!", electronicStamp });
});
const updateCompanyLogo = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let companyLogo = "";
  if (req.files.companyLogo) {
    req.body.companyLogo =
      req.files.companyLogo &&
      req.files.companyLogo.map(
        (file) =>
          `http://62.72.32.44:8000/logo/${file.filename
            .split(" ")
            .join("-")}`
      );
    const directoryPath = path.join(companyLogo, "uploads/logo");

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

    if (req.body.companyLogo !== "") {
      companyLogo = req.body.companyLogo;
      companyLogo = companyLogo[0];
    }
  }

  let updatedProfile = await userModel.findByIdAndUpdate(
    id,
    { companyLogo: companyLogo },
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({ message: "Task updated successfully!", companyLogo });
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
  let ApiFeat = new ApiFeature(userModel.find({ role: "66d33a4b4ad80e468f231f83" }), req.query)
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
results = results.tags
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
    isSuperUser,
    companyName,
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
      isSuperUser,
      companyName,
    },
    { new: true }
  );
  !results && res.status(404).json({ message: "couldn't update! not found!" });
  results && res.json({ message: "updatedd", results });
});
const updateUser2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let {
    projects,
    tags,
  } = req.body;
  let results = await userModel.findByIdAndUpdate(
    id,
    {
      $pull: { projects, tags },
    },
    { new: true }
  );
  !results && res.status(404).json({ message: "couldn't update! not found!" });
  results && res.json({ message: "updatedd", results });});

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
  addIdPhotos,
  updateprofilePic,
  updateIdPhoto,
  getUserTags,
  updateStamp,
  updateCompanyLogo,
};
