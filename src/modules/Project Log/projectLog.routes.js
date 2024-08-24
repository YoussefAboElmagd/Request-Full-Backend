import express from "express";
import * as logController from "./projectLog.controller.js";


const logRouter = express.Router();

// logRouter.post("/", logController.createProjectLog);
// logRouter.delete("/:id", logController.deleteProjectLog);
// logRouter.get("/", logController.getAlllogByAdmin);
// logRouter.get("/:id", logController.getlogById);
// logRouter.get("/docs/:id", logController.getAllDocslog);
// logRouter.get("/status/:status", logController.getAlllogByStatusByAdmin);
// logRouter.get("/user/status/:id", logController.getAlllogByStatusByUser);
// logRouter.put("/members/:id", logController.updatelogMembers);
// logRouter.put("/:id", logController.updatelog);
// logRouter.put(
//     "/images/:id",
//     uploadMixFile("documents", [
//       { name: "documents",  },
//     ]),fileSizeLimitErrorHandler,
//     logController.updatelogDocs
//   );
export default logRouter;
