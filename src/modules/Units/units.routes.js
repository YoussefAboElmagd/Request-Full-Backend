import express from "express";
import * as unitsController from "./units.controller.js";

const unitsRouter = express.Router();

unitsRouter.post("/", unitsController.createUnits);
unitsRouter.get("/", unitsController.getAllUnits);
unitsRouter.put("/:id", unitsController.updateUnits);
unitsRouter.delete("/:id", unitsController.deleteUnits);

export default unitsRouter;
