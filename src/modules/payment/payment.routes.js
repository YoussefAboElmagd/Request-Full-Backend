import express from "express";
import {
  createPayment,
  deletePayment,
  getPaymentByID,
  updatePayment,
} from "./payment.controller.js";
const paymentRouter = express.Router();

paymentRouter.post("/", createPayment);
paymentRouter.get("/:id", getPaymentByID);
paymentRouter.put("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;
