import express from "express";
import * as privacyController from "./privacy.controller.js";

const privacyRouter = express.Router();

privacyRouter.get("/", privacyController.getAllPrivacy);
privacyRouter.post("/", privacyController.createPrivacy);
privacyRouter.put("/:id", privacyController.updatePrivacy);
privacyRouter.delete("/:id", privacyController.deletePrivacy);

export default privacyRouter;
