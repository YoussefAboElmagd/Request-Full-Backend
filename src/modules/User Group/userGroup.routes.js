import express from "express";
import * as userGroupController from "./userGroup.controller.js";

const userGroupRouter = express.Router();

userGroupRouter.post("/", userGroupController.createUserGroup);
userGroupRouter.get("/", userGroupController.getAllUserGroup);
userGroupRouter.get("/user/:id", userGroupController.getAllUserGroupByUser);
userGroupRouter.put("/:id", userGroupController.updateUserGroup);
userGroupRouter.put("/pull/:id", userGroupController.updateUserGroup2);
userGroupRouter.delete("/:id", userGroupController.deleteUserGroup);

export default userGroupRouter;
