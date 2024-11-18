import express from "express";
import * as requestController from "./request.controller.js";

const requestRouter = express.Router();

requestRouter.post("/", requestController.createRequest);
requestRouter.get("/", requestController.getAllRequest);
requestRouter.get("/user/:id", requestController.getAllRequestByUser);
requestRouter.get("/project/:id", requestController.getAllRequestByProject);
requestRouter.get("/task/:id", requestController.getAllRequestByTask);
requestRouter.put("/:id", requestController.updateRequest);
requestRouter.delete("/:id", requestController.deleteRequest);

export default requestRouter;
