import express from "express";
import * as messageController from "./message.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";
import { protectRoutes } from "../auth/auth.controller.js";

const messageRouter = express.Router();

messageRouter.post("/", messageController.createmessage);
messageRouter.get("/:id", messageController.getAllMessageByTwoUsers);
messageRouter.get("/user/:id",protectRoutes, messageController.getAllGroupsByUserProjects);
messageRouter.get("/group/:id", messageController.getAllMessageByGroup);

messageRouter.post(
  "/images",
  uploadMixFile("chat", [
    { name: "docs" },{ name: "voiceNote" },
  ]),fileSizeLimitErrorHandler,
  messageController.addPhotos
);

export default messageRouter;
