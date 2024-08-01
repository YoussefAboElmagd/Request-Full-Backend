import express from "express";

const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile, } from "../../utils/middleWare/fileUploads.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/owners/", usersController.getAllowners);
usersRouter.get("/consultant/", usersController.getAllconsultant);
usersRouter.get("/contractor/", usersController.getAllcontractors);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.delete("/:id", usersController.deleteUser);
usersRouter.post(
  "/photo",
  uploadMixFile("profilePic", [
    { name: "profilePic", maxcount: 1 },
  ]),fileSizeLimitErrorHandler,
  usersController.addPhotos
);
usersRouter.post(
  "/id",
  uploadMixFile("photos", [
    { name: "idPhoto" },
  ]),fileSizeLimitErrorHandler,
  usersController.addIdPhotos
);
export default usersRouter;
