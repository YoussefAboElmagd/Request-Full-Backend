import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import { allowTo, protectRoutes } from "../auth/auth.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", dashboardController.getActiveProjects);
dashboardRouter.get("/user/:id", dashboardController.getActiveProjectsByUser);
dashboardRouter.get("/performance/", dashboardController.getProjectPerformance);
dashboardRouter.get("/performance/user/:id", dashboardController.getProjectPerformanceByUser);
dashboardRouter.get("/country/", dashboardController.getTopCountries);
dashboardRouter.get("/weekly/", dashboardController.weeklyActivity);
dashboardRouter.get("/weekly/user/:id", dashboardController.weeklyActivityByUser);
dashboardRouter.get("/ratio/",protectRoutes,allowTo("admin"), dashboardController.getUserRatioPieChart);
// dashboardRouter.put("/:id", dashboardController.updateDashboard);

export default dashboardRouter;
