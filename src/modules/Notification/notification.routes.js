import express from "express";
import * as notiticationController from "./notification.controller.js";

const notiticationRouter = express.Router();

notiticationRouter.get("/:id", notiticationController.getAllNotification);
notiticationRouter.post("/", notiticationController.createNotification);
notiticationRouter.delete(
  "/one/:id",
  notiticationController.deleteNotification
);
notiticationRouter.delete("/:id", notiticationController.clearNotification);

export default notiticationRouter;
