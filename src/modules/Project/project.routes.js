import express from "express";
import * as projectController from "./project.controller.js";
import { protectRoutes, allowTo } from "../auth/auth.controller.js";

const projectRouter = express.Router();

projectRouter.get("/", projectController.getAllProjectByAdmin);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.get("/docs/:id", projectController.getAllDocsProject);
projectRouter.get(
  "/user/:id",
  protectRoutes,
  projectController.getAllProjectByUser
);
projectRouter.get("/members/:id", projectController.getAllMembersProject);
projectRouter.get(
  "/user/analytics/:id",
  projectController.getAllAnalyticsByUser
);
projectRouter.get(
  "/user/status/:id",
  projectController.getAllProjectByStatusByUser
);
projectRouter.get(
  "/admin/files/",
  projectController.getAllProjectsFilesByAdmin
);
projectRouter.get(
  "/user/files/:id",
  projectController.getAllProjectsFilesByUser
);
projectRouter.get("/files/:id/:projectId", projectController.getFilesByTags);
projectRouter.get("/download/:tagId", projectController.getFilesForDownload);
projectRouter.get("/tags/:id", projectController.getTagsByProject);
projectRouter.get(
  "/tags/progress/:id",
  projectController.getProjectTagProgress
);
projectRouter.get("/counts/:id", projectController.getCounts);
projectRouter.get("/requests/:id", projectController.getModelsAprroved);
projectRouter.get(
  "/invitations/:projectId",
  projectController.getinvitationByproject
);
projectRouter.post("/resendInivite/", projectController.reSendinvite);

projectRouter.post("/", projectController.createProject);

projectRouter.put("/:id", projectController.updateProject);
projectRouter.put("/name/:id", projectController.updateProject);
projectRouter.put("/member/:id", projectController.addMemberForProject);
projectRouter.put("/pull/:id", projectController.updateProject2);
projectRouter.put("/", projectController.updateStatusProject);

projectRouter.delete("/:id", projectController.deleteProject);

export default projectRouter;
