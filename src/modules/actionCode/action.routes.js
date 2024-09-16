import express from "express";
import * as actionController from "./action.controller.js";

const actionRouter = express.Router();

actionRouter.post("/", actionController.createAction);
actionRouter.get("/", actionController.getAllAction);
actionRouter.put("/:id", actionController.updateAction);
actionRouter.delete("/:id", actionController.deleteAction);

export default actionRouter;
