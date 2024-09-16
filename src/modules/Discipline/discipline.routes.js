import express from "express";
import * as disciplineController from "./discipline.controller.js";

const disciplineRouter = express.Router();

disciplineRouter.post("/", disciplineController.createDiscipline);
disciplineRouter.get("/", disciplineController.getAllDiscipline);
disciplineRouter.put("/:id", disciplineController.updateDiscipline);
disciplineRouter.delete("/:id", disciplineController.deleteDiscipline);

export default disciplineRouter;
