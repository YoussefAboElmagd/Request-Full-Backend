import express from "express";
import * as messageController from "./message.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

const messageRouter = express.Router();

messageRouter.post("/", messageController.createmessage);
messageRouter.get("/:id", messageController.getAllmessageByTask);

messageRouter.post(
  "/images",
  uploadMixFile("image", [
    { name: "docs" },
  ]),fileSizeLimitErrorHandler,
  messageController.addPhotos
);

export default messageRouter;
