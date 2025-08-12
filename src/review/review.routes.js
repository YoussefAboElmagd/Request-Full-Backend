import express from "express";
import {
  createReview,
  getReviews,
  getReviewsForAdmin,
  manageReview,
} from "./review.controller.js";
import { authen } from "../utils/middleWare/authen.js";

const reviewRoutes = express.Router();

reviewRoutes.get(
  "/admin/all",
  authen(["admin", "assistant"]),
  getReviewsForAdmin
);
reviewRoutes.post("/", createReview);
reviewRoutes.get("/", getReviews);
reviewRoutes.patch("/:id", authen(["admin", "assistant"]), manageReview);

export default reviewRoutes;
