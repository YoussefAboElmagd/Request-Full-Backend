import express from "express";
import * as tagsController from "./tags.controller.js";

const tagsRouter = express.Router();

tagsRouter.post("/", tagsController.createTags);
tagsRouter.get("/", tagsController.getAllTagsByAdmin);
tagsRouter.get("/:id", tagsController.getTagByUser);
tagsRouter.put("/:id", tagsController.updateTags);
tagsRouter.delete("/:id", tagsController.deleteTags);

export default tagsRouter;
