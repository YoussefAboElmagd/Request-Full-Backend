import express from "express";
import * as groupChatController from "./groupChat.controller.js";

const groupChatRouter = express.Router();

groupChatRouter.post("/", groupChatController.createGroupChat);
groupChatRouter.get("/", groupChatController.getAllGroupChat);
groupChatRouter.put("/:id", groupChatController.updateGroupChat);
groupChatRouter.put("/pull/:id", groupChatController.updateGroupChat2);
groupChatRouter.delete("/:id", groupChatController.deleteGroupChat);

export default groupChatRouter;
