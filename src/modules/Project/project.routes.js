import express from "express";
import * as projectController from "./project.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

const projectRouter = express.Router();

projectRouter.get("/", projectController.getAllProjectByAdmin);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.post("/", projectController.createProject);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);
projectRouter.put(
    "/images/:id",
    uploadMixFile("documments", [
      { name: "documments",  },
    ]),fileSizeLimitErrorHandler, 
    projectController.updateProjectPhoto
  );
export default projectRouter;
