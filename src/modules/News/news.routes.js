import express from "express";
import * as newsController from "./news.controller.js";

const newsRouter = express.Router();

newsRouter.post("/", newsController.createNews);
newsRouter.get("/", newsController.getAllNews);
newsRouter.put("/:id", newsController.updateNews);
newsRouter.delete("/:id", newsController.deleteNews);

export default newsRouter;
