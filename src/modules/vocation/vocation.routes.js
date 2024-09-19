import express from "express";
import * as vocationController from "./vocation.controller.js";

const vocationRouter = express.Router();

vocationRouter.post("/", vocationController.createVocation);
vocationRouter.get("/", vocationController.getAllVocation);
vocationRouter.put("/:id", vocationController.updateVocation);
vocationRouter.delete("/:id", vocationController.deleteVocation);

export default vocationRouter;
