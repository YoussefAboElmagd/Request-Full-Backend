import express from "express";
import * as projectController from "./project.controller.js";
import { protectRoutes , allowTo } from "../auth/auth.controller.js";

const projectRouter = express.Router();

projectRouter.get("/", projectController.getAllProjectByAdmin);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.get("/docs/:id", projectController.getAllDocsProject);
projectRouter.get("/user/:id",protectRoutes, projectController.getAllProjectByUser);
projectRouter.get("/members/:id", projectController.getAllMembersProject);
projectRouter.get("/user/analytics/:id", projectController.getAllAnalyticsByUser);
projectRouter.get("/user/status/:id",projectController.getAllProjectByStatusByUser);
projectRouter.get("/admin/files/",projectController.getAllProjectsFilesByAdmin);
projectRouter.get("/user/files/:id",projectController.getAllProjectsFilesByUser);
projectRouter.get("/files/:id/:projectId",projectController.getFilesByTags);
projectRouter.get("/download/:tagId",projectController.getFilesForDownload);
projectRouter.get("/tags/:id",projectController.getTagsByProject);
projectRouter.post("/", projectController.createProject);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.put("/pull/:id", projectController.updateProject2);
projectRouter.delete("/:id", projectController.deleteProject);

export default projectRouter;
