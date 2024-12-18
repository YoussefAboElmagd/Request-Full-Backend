import express from "express";
import * as groupChatController from "./groupChat.controller.js";
import { protectRoutes } from "../auth/auth.controller.js";

const groupChatRouter = express.Router();

groupChatRouter.post("/", groupChatController.createGroupChat);
groupChatRouter.get("/", groupChatController.getAllGroupChat);
groupChatRouter.get("/:id", groupChatController.getGroupChatById);
groupChatRouter.get("/:id/project/:projectId", groupChatController.getUsersToAdd);
groupChatRouter.get("/project/:id",protectRoutes, groupChatController.getAllChatsForUserByproject);
groupChatRouter.put("/:id", groupChatController.updateGroupChat);
groupChatRouter.put("/pull/:id", groupChatController.updateGroupChat2);
groupChatRouter.delete("/:id", groupChatController.deleteGroupChat);

export default groupChatRouter;
