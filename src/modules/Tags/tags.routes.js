import express from "express";
import * as tagsController from "./tags.controller.js";

const tagsRouter = express.Router();

tagsRouter.post("/:id", tagsController.createTags);
tagsRouter.get("/", tagsController.getAllTagsByAdmin);
tagsRouter.get("/user/:id", tagsController.getAllTagsByUser);
tagsRouter.get("/project/:id", tagsController.getAllTagsByProject);
tagsRouter.put("/:id", tagsController.updateTags);
tagsRouter.delete("/:id", tagsController.deleteTags);

export default tagsRouter;
