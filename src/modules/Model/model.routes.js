import express from "express";
import * as modelController from "./model.controller.js";

const modelRouter = express.Router();

modelRouter.post("/", modelController.createModel);
modelRouter.get("/", modelController.getAllModel);
modelRouter.put("/:id", modelController.updateModel);
modelRouter.delete("/:id", modelController.deleteModel);

export default modelRouter;
