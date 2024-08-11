import express from "express";
import * as newsController from "./news.controller.js";

const newsRouter = express.Router();

newsRouter.post("/", newsController.createNews);
newsRouter.get("/", newsController.getAllNews);
newsRouter.put("/:id", newsController.getAllNews);
newsRouter.delete("/:id", newsController.getAllNews);

export default newsRouter;
