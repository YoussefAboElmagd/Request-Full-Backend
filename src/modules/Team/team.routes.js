import express from "express";
import * as teamController from "./team.controller.js";

const teamRouter = express.Router();

teamRouter.post("/", teamController.createTeam);
teamRouter.get("/", teamController.getAllTeamByAdmin);
teamRouter.get("/user/:id", teamController.getAllTeamByUser);
teamRouter.get("/:id", teamController.getTeamById);
teamRouter.put("/:id", teamController.updateTeam);
teamRouter.put("/pull/:id", teamController.updateTeamMembers);
teamRouter.delete("/:id", teamController.deleteTeam);


export default teamRouter;
