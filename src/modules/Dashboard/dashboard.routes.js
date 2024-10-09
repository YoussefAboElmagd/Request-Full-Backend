import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import { allowTo, protectRoutes } from "../auth/auth.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", dashboardController.getActiveProjects);
dashboardRouter.get("/performance/", dashboardController.getProjectPerformance);
dashboardRouter.get("/country/", dashboardController.getTopCountries);
dashboardRouter.get("/ratio/",protectRoutes,allowTo("admin"), dashboardController.getUserRatioPieChart);
dashboardRouter.put("/:id", dashboardController.updateDashboard);

export default dashboardRouter;
