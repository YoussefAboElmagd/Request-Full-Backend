import express from "express";
import * as logController from "./projectLog.controller.js";
import {
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";

const logRouter = express.Router();

// logRouter.get("/", logController.getAlllogByAdmin);
// logRouter.get("/:id", logController.getlogById);
// logRouter.get("/docs/:id", logController.getAllDocslog);
// logRouter.get("/status/:status", logController.getAlllogByStatusByAdmin);
// logRouter.get("/user/status/:id", logController.getAlllogByStatusByUser);
// logRouter.post("/", logController.createlog);
// logRouter.put("/members/:id", logController.updatelogMembers);
// logRouter.put("/:id", logController.updatelog);
// logRouter.delete("/:id", logController.deletelog);
// logRouter.put(
//     "/images/:id",
//     uploadMixFile("documents", [
//       { name: "documents",  },
//     ]),fileSizeLimitErrorHandler,
//     logController.updatelogDocs
//   );
export default logRouter;
