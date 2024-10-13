import express from "express";
import * as userTypeController from "./userType.controller.js";

const userTypeRouter = express.Router();

userTypeRouter.post("/", userTypeController.createUserType);
userTypeRouter.get("/", userTypeController.getAllUserType);
userTypeRouter.get("/main/", userTypeController.getMainUserType);
userTypeRouter.put("/:id", userTypeController.updateUserType);
userTypeRouter.delete("/:id", userTypeController.deleteUserType);

export default userTypeRouter;
