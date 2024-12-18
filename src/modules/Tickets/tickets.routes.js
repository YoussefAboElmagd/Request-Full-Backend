import express from "express";
import * as ticketsController from "./tickets.controller.js";

const ticketsRouter = express.Router();

ticketsRouter.post("/", ticketsController.createTicket);
ticketsRouter.get("/", ticketsController.getAllTickets);
ticketsRouter.get("/:id", ticketsController.getTicketById);
ticketsRouter.put("/:id", ticketsController.updateTickets);
// ticketsRouter.put("/pull/:id", ticketsController.updateTickets2);
ticketsRouter.delete("/:id", ticketsController.deleteTicket);

export default ticketsRouter;
