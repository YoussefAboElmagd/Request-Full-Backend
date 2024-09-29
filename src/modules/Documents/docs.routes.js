import express from "express";
import * as docsController from "./docs.controller.js";
import {
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";

const docsRouter = express.Router();


// docsRouter.get("/project/:id", docsController.getAllDocsByProject);
docsRouter.get("/task/:id", docsController.getAllDocsByTask);
docsRouter.delete("/:id", docsController.deleteDocs);

docsRouter.post(
  "/",
  uploadMixFile("documents", [{ name: "document" }]),
  fileSizeLimitErrorHandler,
  docsController.createDocs
);
docsRouter.put(
  "/:id",
  docsController.updateDocs
);

export default docsRouter;
