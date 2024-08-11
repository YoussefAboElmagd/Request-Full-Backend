import express from "express";
import * as complaintController from "./complaint.controller.js";

const complaintRouter = express.Router();

complaintRouter.post("/", complaintController.createComplaint);
complaintRouter.get("/", complaintController.getAllComplaint);
complaintRouter.get("/:id", complaintController.getAllComplaintByUser);

export default complaintRouter;
