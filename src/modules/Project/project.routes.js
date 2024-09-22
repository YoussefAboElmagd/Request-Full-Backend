import express from "express";
import * as projectController from "./project.controller.js";
import { protectRoutes } from "../auth/auth.controller.js";

const projectRouter = express.Router();

projectRouter.get("/", projectController.getAllProjectByAdmin);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.get("/docs/:id", projectController.getAllDocsProject);
projectRouter.get("/admin/status/",projectController.getAllProjectByStatusByAdmin);
projectRouter.get("/user/:id", projectController.getAllProjectByUser);
projectRouter.get("/members/:id", projectController.getAllMembersProject);
projectRouter.get("/user/analytics/:id", projectController.getAllAnalyticsByUser);
projectRouter.get("/user/status/:id",projectController.getAllProjectByStatusByUser);
projectRouter.get("/admin/files/",projectController.getAllProjectsFilesByAdmin);
projectRouter.get("/user/files/:id",projectController.getAllProjectsFilesByUser);
projectRouter.post("/", projectController.createProject);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);

export default projectRouter;
