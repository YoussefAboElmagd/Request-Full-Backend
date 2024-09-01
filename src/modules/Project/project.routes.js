import express from "express";
import * as projectController from "./project.controller.js";

const projectRouter = express.Router();

projectRouter.get("/", projectController.getAllProjectByAdmin);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.get("/docs/:id", projectController.getAllDocsProject);
projectRouter.get(
  "/status/:status",
  projectController.getAllProjectByStatusByAdmin
);
projectRouter.get("/user/status/:id",projectController.getAllProjectByStatusByUser);
projectRouter.get("/files/:id",projectController.getAllProjectFiles);
projectRouter.post("/", projectController.createProject);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);

export default projectRouter;
