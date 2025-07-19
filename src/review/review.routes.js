import express from "express";
import { createReview, getReviews } from "./review.controller.js";

const reviewRoutes = express.Router();

reviewRoutes.post("/", createReview);
reviewRoutes.get("/", getReviews);

export default reviewRoutes;
