import express from "express";
import * as dashboardController from "./dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", dashboardController.getAllDashboard);
dashboardRouter.put("/:id", dashboardController.updateDashboard);

export default dashboardRouter;
