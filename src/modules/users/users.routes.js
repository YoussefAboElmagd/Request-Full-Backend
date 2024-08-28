import express from "express";

const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import { fileFilterHandler, fileSizeLimitErrorHandler, uploadMixFile, } from "../../utils/middleWare/fileUploads.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/owners/", usersController.getAllowners);
usersRouter.get("/consultant/", usersController.getAllconsultant);
usersRouter.get("/contractor/", usersController.getAllcontractors);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.put("/projects/:id", usersController.updateUserProjects);
usersRouter.delete("/:id", usersController.deleteUser);
usersRouter.post(
  "/photo/:id",
  uploadMixFile("profilePic", [
    { name: "profilePic",},
  ]),fileFilterHandler,fileSizeLimitErrorHandler,
  usersController.addPhotos
);
usersRouter.put(
  "/photo/:id",
  uploadMixFile("profilePic", [
    { name: "profilePic",},
  ]),fileFilterHandler,fileSizeLimitErrorHandler,
  usersController.updateprofilePic
);

usersRouter.post(
  "/id/:id",
  uploadMixFile("photos", [
    { name: "idPhoto" },
  ]),fileSizeLimitErrorHandler,
  usersController.addIdPhotos
);
usersRouter.put(
  "/id/:id",
  uploadMixFile("photos", [
    { name: "idPhoto" },
  ]),fileSizeLimitErrorHandler,
  usersController.updateIdPhoto
);
export default usersRouter;
