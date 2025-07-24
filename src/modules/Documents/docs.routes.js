import express from "express";
import * as docsController from "./docs.controller.js";
import {
  fileSizeLimitErrorHandler,
  uploadMixFile,
  uploadSingleFile,
} from "../../utils/middleWare/fileUploads.js";

const docsRouter = express.Router();

docsRouter.get("/task/:id", docsController.getAllDocsByTask);
docsRouter.delete("/:id", docsController.deleteDocs);

docsRouter.post(
  "/",
  uploadSingleFile("documents", "document"),
  // fileSizeLimitErrorHandler,
  docsController.createDocs
);
docsRouter.put("/:id", docsController.updateDocs);

export default docsRouter;
