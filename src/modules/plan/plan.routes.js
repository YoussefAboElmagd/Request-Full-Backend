import express from "express";
import {
  createPlan,
  deletePlan,
  getAllPlans,
  getPlanById,
  uptadePlan,
  uptadePlan2,
} from "./plan.controller.js";
const planRouter = express.Router();

planRouter.post("/", createPlan);
planRouter.get("/", getAllPlans);
planRouter.get("/:id", getPlanById);
planRouter.put("/:id", uptadePlan);
planRouter.put("/pull/:id", uptadePlan2);
planRouter.delete("/:id", deletePlan);

export default planRouter;
