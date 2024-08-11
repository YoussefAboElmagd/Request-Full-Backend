import express from "express";
import * as docsController from "./docs.controller.js";
import {
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";

const docsRouter = express.Router();


docsRouter.get("/:id", docsController.getAllDocsByProject);
docsRouter.delete("/:id", docsController.deleteDocs);

docsRouter.post(
  "/",
  uploadMixFile("documents", [{ name: "document" }]),
  fileSizeLimitErrorHandler,
  docsController.createDocsComment
);
docsRouter.put(
  "/:id",
  uploadMixFile("documents", [{ name: "document" }]),
  fileSizeLimitErrorHandler,
  docsController.updateDocs
);

export default docsRouter;
