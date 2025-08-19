import express from "express";
import {
  createReview,
  getReviews,
  getReviewsForAdmin,
  manageReview,
} from "./review.controller.js";
import { authen, access } from "../utils/middleWare/authen.js";

const reviewRoutes = express.Router();

reviewRoutes.get(
  "/admin/all",
  authen(["admin", "assistant"]),
  access("read"),
  getReviewsForAdmin
);
reviewRoutes.post("/", createReview);
reviewRoutes.get("/", getReviews);
reviewRoutes.patch(
  "/:id",
  authen(["admin", "assistant"]),
  access("update"),
  manageReview
);

export default reviewRoutes;
