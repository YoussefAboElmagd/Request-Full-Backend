import express from "express";
import * as complaintController from "./complaint.controller.js";

const complaintRouter = express.Router();

complaintRouter.post("/", complaintController.createComplaint);
complaintRouter.get("/", complaintController.getAllComplaintByAdmin);
complaintRouter.get("/:id", complaintController.getAllComplaintByUser);
complaintRouter.delete("/:id", complaintController.deleteComplaint);


export default complaintRouter;
