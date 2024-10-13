import express from "express";
import * as tableController from "./table.controller.js";

const tableRouter = express.Router();

tableRouter.post("/", tableController.createTable);
tableRouter.get("/", tableController.getAllTable);
tableRouter.get("/:id", tableController.getAllTableById);
tableRouter.get("/project/:id", tableController.getAllTableByProject);
tableRouter.put("/:id", tableController.updateTable);
tableRouter.put("/pull/:id", tableController.updateTablePull);
tableRouter.delete("/:id", tableController.deleteTable);

export default tableRouter;
