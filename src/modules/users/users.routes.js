import express from "express";

const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import {
  fileFilterHandler,
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/owners/", usersController.getAllowners);
usersRouter.get("/consultant/", usersController.getAllconsultant);
usersRouter.get("/contractor/", usersController.getAllcontractors);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.get("/tags/:id", usersController.getUserTags);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.put("/pull/:id", usersController.updateUser2);
usersRouter.delete("/:id", usersController.deleteUser);

usersRouter.put(
  "/photo/:id",
  uploadMixFile("profilePic", [{ name: "profilePic" }]),
  fileFilterHandler,
  fileSizeLimitErrorHandler,
  usersController.updateprofilePic
);

usersRouter.post(
  "/id/:id",
  uploadMixFile("photos", [{ name: "idPhoto" }]),
  fileSizeLimitErrorHandler,
  usersController.addIdPhotos
);
usersRouter.put(
  "/id/:id",
  uploadMixFile("photos", [{ name: "idPhoto" }]),
  fileSizeLimitErrorHandler,
  usersController.updateIdPhoto
);
usersRouter.put(
  "/logo/:id",
  uploadMixFile("logo", [{ name: "companyLogo" }]),
  fileSizeLimitErrorHandler,
  usersController.updateCompanyLogo
);
usersRouter.put(
  "/stamp/:id",
  uploadMixFile("stamp", [{ name: "electronicStamp" }]),
  fileSizeLimitErrorHandler,
  usersController.updateStamp
);
export default usersRouter;
