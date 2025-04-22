import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import { protectRoutes, allowTo } from "../auth/auth.controller.js";

taskRouter.get("/", taskController.getAllTaskByAdmin);
taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.get("/project/:id", taskController.getAllTaskByProject);
taskRouter.get("/assignees/:id", taskController.getAllAssigness);
taskRouter.get("/sub/:id", taskController.getAllSubTasksByParentTask);
taskRouter.get("/parentTasks/:id/:projectId", taskController.getAllParentTasks);
// taskRouter.get("/recurring/:id/:projectId", taskController.scheduleRecurringTasks);
taskRouter.post("/", taskController.createTask);
taskRouter.put("/:id", taskController.updateTask);
taskRouter.put("/", taskController.updatestatusTask );
taskRouter.put("/pull/:id", taskController.updateTask2);
taskRouter.delete("/:id", taskController.deleteTask);

export default taskRouter;
