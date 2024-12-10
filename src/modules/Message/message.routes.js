import express from "express";
import * as messageController from "./message.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

const messageRouter = express.Router();

messageRouter.post("/", messageController.createmessage);
messageRouter.get("/:id", messageController.getAllMessageByTwoUsers);
messageRouter.get("/user/:id", messageController.getAllProjectByUser);

messageRouter.post(
  "/images",
  uploadMixFile("chat", [
    { name: "docs" },{ name: "voiceNote" },
  ]),fileSizeLimitErrorHandler,
  messageController.addPhotos
);

export default messageRouter;
