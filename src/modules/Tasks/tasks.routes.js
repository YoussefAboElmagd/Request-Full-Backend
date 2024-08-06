import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

taskRouter.get("/", taskController.getAllTaskByAdmin);
taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.post(
  "/",
  taskController.createTask
);
taskRouter.put("/update/users/:id", taskController.updateTask);
taskRouter.delete("/:id", taskController.deleteTask);

taskRouter.put(
  "/images/:id",
  uploadMixFile("tasks", [
    { name: "documments",  },
  ]),fileSizeLimitErrorHandler, 
  taskController.updateTaskPhoto
);

export default taskRouter;
